import { Handlers } from './handlers';
import { Token } from './token';

export type QueryHandler<Params extends unknown[], Result> = (...params: Params) => Promise<Result>;

export class QueryBus {
  private handlers = new Handlers();

  register<Params extends unknown[], Result>(
    token: Token<Params, Result>,
    handler: QueryHandler<Params, Result>
  ): void {
    this.handlers.register(token, handler);
  }

  execute<Params extends unknown[], Result>(
    token: Token<Params, Result>,
    ...params: Params
  ): Promise<Result> {
    return this.handlers.execute(token, ...params) as Promise<Result>;
  }
}
