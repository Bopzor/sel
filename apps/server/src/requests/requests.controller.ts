import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { TOKENS } from '../tokens';

import { RequestsRepository } from './requests.repository';

export class RequestsController {
  readonly router = Router();

  static inject = injectableClass(this, TOKENS.requestsRepository);

  constructor(private readonly requestsRepository: RequestsRepository) {
    this.router.get('/', this.listRequests);
    this.router.get('/:requestId', this.getRequest);
  }

  private listRequests: RequestHandler<never, shared.Request[]> = async (req, res) => {
    res.json(await this.requestsRepository.listRequests());
  };

  private getRequest: RequestHandler<{ requestId: string }, shared.Request> = async (req, res) => {
    const request = await this.requestsRepository.getRequest(req.params.requestId);

    if (!request) {
      return res.status(404).end();
    }

    res.json(request);
  };
}
