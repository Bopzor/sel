import { Bus } from '@sel/cqs';
import { Token, injectableClass } from 'ditox';

import { container } from '../../container';
import { Database } from '../../persistence/database';
import { TOKENS } from '../../tokens';
import { EventPublisher } from '../events/event-publisher';

import { CommandHandler } from './command-handler';

export class CommandBus extends Bus {
  static inject = injectableClass(this, TOKENS.database, TOKENS.eventPublisher);

  constructor(private readonly database: Database, private readonly eventPublisher: EventPublisher) {
    super();
  }

  init() {
    this.registerHook((next) => this.eventPublisher.provide(next));
    this.registerHook((next) => this.database.createTransaction(next));
  }

  async executeCommand<Command>(token: Token<CommandHandler<Command>>, command: Command): Promise<void> {
    const handler = container.resolve(token);

    await this.execute(handler.handle.bind(handler), command);
  }
}
