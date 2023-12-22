import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { SessionProvider } from '../session/session.provider';
import { TOKENS } from '../tokens';

import { RequestRepository } from './request.repository';

export class RequestController {
  readonly router = Router();

  static inject = injectableClass(this, TOKENS.sessionProvider, TOKENS.requestRepository);

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly requestRepository: RequestRepository
  ) {
    this.router.use(this.authenticated);
    this.router.get('/', this.listRequests);
    this.router.get('/:requestId', this.getRequest);
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
}
