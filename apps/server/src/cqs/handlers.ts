import { Token } from './token';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...params: any[]) => any;

export class Handlers {
  private handlers = new Map<symbol, AnyFunction>();

  register(token: Token<unknown[], unknown>, handler: AnyFunction): void {
    this.handlers.set(token.__symbol, handler);
  }

  execute(token: Token<unknown[], unknown>, ...params: unknown[]): unknown {
    const handler = this.handlers.get(token.__symbol);

    if (!handler) {
      throw new Error(`No handler for token ${token.__symbol.description}`);
    }

    return handler(...params);
  }
}
