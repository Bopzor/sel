import { Bus } from '@sel/cqs';
import { Token, injectableClass } from 'ditox';

import { container } from '../../container';

import { QueryHandler } from './query-handler';

export class QueryBus extends Bus {
  static inject = injectableClass(this);

  async executeQuery<Query, Result>(
    token: Token<QueryHandler<Query, Result>>,
    query: Query
  ): Promise<Result> {
    const handler = container.resolve(token);

    return this.execute(handler.handle.bind(handler), query);
  }
}
