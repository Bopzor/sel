import { Token, injectableClass } from 'ditox';

import { container } from '../../container';

import { Bus } from './bus';

interface QueryHandler<Params extends unknown[], Result> {
  handle(...params: Params): Promise<Result>;
}

export class QueryBus extends Bus {
  static inject = injectableClass(this);

  async executeQuery<Params extends unknown[], Result>(
    token: Token<QueryHandler<Params, Result>>,
    ...params: Params
  ): Promise<Result> {
    const handler = container.resolve(token);

    return this.execute(handler.handle.bind(handler), ...params);
  }
}
