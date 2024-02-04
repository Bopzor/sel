import util from 'node:util';

import { Bus } from '@sel/cqs';
import { Container, Token, injectableClass } from 'ditox';

import { Database } from '../../persistence/database';
import { TOKENS } from '../../tokens';
import { EventPublisher } from '../events/event-publisher';
import { LoggerPort } from '../logger/logger.port';

import { CommandHandler } from './command-handler';

export class CommandBus extends Bus {
  static inject = injectableClass(
    this,
    TOKENS.container,
    TOKENS.logger,
    TOKENS.database,
    TOKENS.eventPublisher
  );

  constructor(
    private readonly container: Container,
    private readonly logger: LoggerPort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisher
  ) {
    super();
  }

  init() {
    this.registerHook((next) => this.eventPublisher.provide(next));
    this.registerHook((next) => this.database.createTransaction(next));
  }

  async executeCommand<Command>(token: Token<CommandHandler<Command>>, command: Command): Promise<void> {
    const handler = this.container.resolve(token);

    this.logger.info(`Executing command ${token.symbol.description}`, util.inspect(command));

    try {
      await this.execute(handler.handle.bind(handler), command);
    } catch (error) {
      this.logger.error(`Command ${token.symbol.description} failed`, error);
      throw error;
    }
  }
}
