import { Bus } from '@sel/cqs';
import { Token, injectableClass } from 'ditox';

import { container } from '../../container';
import { Database } from '../../persistence/database';
import { TOKENS } from '../../tokens';
import { EventPublisher } from '../events/event-publisher';

interface CommandHandler<Params extends unknown[]> {
  handle(...params: Params): Promise<void>;
}

export class CommandBus extends Bus {
  static inject = injectableClass(this, TOKENS.database, TOKENS.eventPublisher);

  constructor(private readonly database: Database, private readonly eventPublisher: EventPublisher) {
    super();
  }

  init() {
    this.registerHook((next) => this.eventPublisher.provide(next));
    this.registerHook((next) => this.database.createTransaction(next));
  }

  async executeCommand<Params extends unknown[]>(
    token: Token<CommandHandler<Params>>,
    ...params: Params
  ): Promise<void> {
    const handler = container.resolve(token);

    await this.execute(handler.handle.bind(handler), ...params);
  }
}
