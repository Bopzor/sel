import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../authentication/session.provider';
import { EntityNotFound } from '../domain-error';
import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { RequestRepository } from '../persistence/repositories/request/request.repository';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

import { MemberIsNotAuthor, RequestNotFound } from './request-errors';

export class RequestController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.sessionProvider,
    TOKENS.commandBus,
    TOKENS.queryBus,
    TOKENS.requestRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly sessionProvider: SessionProvider,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly requestRepository: RequestRepository
  ) {
    this.router.use(this.authenticated);

    this.router.get('/', this.listRequests);
    this.router.get('/:requestId', this.getRequest);
    this.router.post('/', this.createRequest);
    this.router.put('/:requestId', this.canEditRequest, this.editRequest);
    this.router.post('/:requestId/comment', this.createComment);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listRequests: RequestHandler<never, shared.Request[]> = async (req, res) => {
    res.json(await this.queryBus.executeQuery(QUERIES.listRequests));
  };

  getRequest: RequestHandler<{ requestId: string }, shared.Request> = async (req, res) => {
    const request = await this.queryBus.executeQuery(QUERIES.getRequest, {
      requestId: req.params.requestId,
    });

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
    const requestId = this.generator.id();
    const member = this.sessionProvider.getMember();
    const data = RequestController.requestSchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.createRequest, {
      requestId,
      requesterId: member.id,
      ...data,
    });

    res.status(HttpStatus.created).send(requestId);
  };

  canEditRequest: RequestHandler<{ requestId: string }> = async (req, res, next) => {
    const member = this.sessionProvider.getMember();
    const requestId = req.params.requestId;
    const request = await this.requestRepository.getRequest(requestId);

    if (!request) {
      throw new RequestNotFound(requestId);
    }

    if (request.requesterId !== member.id) {
      throw new MemberIsNotAuthor(request.id, member.id);
    }

    next();
  };

  editRequest: RequestHandler<{ requestId: string }> = async (req, res) => {
    const requestId = req.params.requestId;
    const data = RequestController.requestSchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.editRequest, {
      requestId,
      ...data,
    });

    res.end();
  };

  private static createCommentSchema = z.object({
    body: z.string().trim(),
  });

  createComment: RequestHandler<{ requestId: string }> = async (req, res) => {
    const commentId = this.generator.id();
    const requestId = req.params.requestId;
    const member = this.sessionProvider.getMember();
    const data = RequestController.createCommentSchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.createRequestComment, {
      commentId,
      requestId,
      authorId: member.id,
      text: data.body,
    });

    res.status(HttpStatus.created).send(commentId);
  };
}
