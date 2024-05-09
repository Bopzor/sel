import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { SessionProvider } from '../authentication/session.provider';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { QUERIES, TOKENS } from '../tokens';

export class InterestController {
  readonly router = Router();

  static inject = injectableClass(this, TOKENS.sessionProvider, TOKENS.queryBus);

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly queryBus: QueryBus,
  ) {
    this.router.use(this.authenticated);

    this.router.get('/', this.listInterests);
  }

  private authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  public listInterests: RequestHandler<never, shared.Interest[]> = async (req, res) => {
    res.json(await this.queryBus.executeQuery(QUERIES.listInterests, {}));
  };
}
