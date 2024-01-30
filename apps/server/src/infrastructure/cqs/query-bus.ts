import { Bus } from '@sel/cqs';
import { Container, Token, injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';

import { QueryHandler } from './query-handler';

export class QueryBus extends Bus {
  static inject = injectableClass(this, TOKENS.container);

  constructor(private readonly container: Container) {
    super();
  }

  async executeQuery<Query, Result>(
    token: Token<QueryHandler<Query, Result>>,
    query: Query
  ): Promise<Result> {
    const handler = this.container.resolve(token);

    return this.execute(handler.handle.bind(handler), query);
  }
}
