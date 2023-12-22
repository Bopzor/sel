import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { RequestRepository } from './request.repository';
import { RequestService } from './request.service';

export class RequestController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.sessionProvider,
    TOKENS.requestService,
    TOKENS.requestRepository
  );

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly requestService: RequestService,
    private readonly requestRepository: RequestRepository
  ) {
    this.router.use(this.authenticated);
    this.router.get('/', this.listRequests);
    this.router.get('/:requestId', this.getRequest);
    this.router.post('/', this.createRequest);
  }

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
      return res.status(404).end();
    }

    res.json(request);
  };

  private static createRequestSchema = z.object({
    title: z.string().trim().max(256),
    body: z.string().trim(),
  });

  createRequest: RequestHandler = async (req, res) => {
    const member = this.sessionProvider.getMember();
    const data = RequestController.createRequestSchema.parse(req.body);

    const requestId = await this.requestService.createRequest(member.id, data.title, data.body);

    res.status(201).send(requestId);
  };
}
