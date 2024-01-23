import { AsyncLocalStorage } from 'node:async_hooks';

import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { CommentsFacade } from '../comments/comments.facade';
import { HttpStatus } from '../http-status';
import { RequestRepository } from '../persistence/repositories/request/request.repository';
import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { MemberIsNotAuthor, RequestNotFound } from './errors';
import { Request } from './request.entity';
import { RequestService } from './request.service';

export class RequestController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.sessionProvider,
    TOKENS.commentsFacade,
    TOKENS.requestService,
    TOKENS.requestRepository
  );

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly commentsFacade: CommentsFacade,
    private readonly requestService: RequestService,
    private readonly requestRepository: RequestRepository
  ) {
    this.router.use('/:requestId', this.provideRequest);

    this.router.use(this.authenticated);
    this.router.get('/', this.listRequests);
    this.router.get('/:requestId', this.getRequest);
    this.router.post('/', this.createRequest);
    this.router.put('/:requestId', this.canEditRequest, this.editRequest);
    this.router.post('/:requestId/comment', this.createComment);
  }

  private requestStorage = new AsyncLocalStorage<Request>();

  private get request() {
    return defined(this.requestStorage.getStore(), 'Request is not provided');
  }

  provideRequest: RequestHandler<{ requestId: string }> = async (req, res, next) => {
    const requestId = req.params.requestId;
    const request = await this.requestRepository.getRequest(requestId);

    if (!request) {
      throw new RequestNotFound(requestId);
    }

    this.requestStorage.run(request, next);
  };

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listRequests: RequestHandler<never, shared.Request[]> = async (req, res) => {
    res.json(await this.requestRepository.query_listRequests());
  };

  getRequest: RequestHandler<{ requestId: string }, shared.Request> = async (req, res) => {
    const request = await this.requestRepository.query_getRequest(req.params.requestId);

    if (!request) {
      return res.status(HttpStatus.notFound).end();
    }

    res.json(request);
  };

  private static requestSchema = z.object({
    title: z.string().trim().max(256),
    body: z.string().trim(),
  });

  createRequest: RequestHandler = async (req, res) => {
    const member = this.sessionProvider.getMember();
    const data = RequestController.requestSchema.parse(req.body);

    const requestId = await this.requestService.createRequest(member.id, data.title, data.body);

    res.status(HttpStatus.created).send(requestId);
  };

  canEditRequest: RequestHandler<{ requestId: string }> = async (req, res, next) => {
    const member = this.sessionProvider.getMember();

    if (this.request.requesterId !== member.id) {
      throw new MemberIsNotAuthor(this.request.id, member.id);
    }

    next();
  };

  editRequest: RequestHandler<{ requestId: string }> = async (req, res) => {
    const data = RequestController.requestSchema.parse(req.body);

    await this.requestService.editRequest(this.request, data.title, data.body);

    res.end();
  };

  private static createCommentSchema = z.object({
    body: z.string().trim(),
  });

  createComment: RequestHandler<{ requestId: string }> = async (req, res) => {
    const requestId = this.request.id;
    const member = this.sessionProvider.getMember();
    const data = RequestController.createCommentSchema.parse(req.body);

    const commentId = await this.requestService.createComment(requestId, member.id, data.body);

    res.status(HttpStatus.created).send(commentId);
  };
}
