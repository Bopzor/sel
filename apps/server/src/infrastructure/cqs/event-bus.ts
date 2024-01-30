import { EventBus as BaseEventBus } from '@sel/cqs';
import { ClassType } from '@sel/utils';
import { Container, Token, injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ErrorReporterPort } from '../error-reporter/error-reporter.port';

import { EventHandler } from './event-handler';

export class EventBus extends BaseEventBus {
  static inject = injectableClass(this, TOKENS.container, TOKENS.errorReporter);

  constructor(private readonly container: Container, errorReporter: ErrorReporterPort) {
    super((error) => errorReporter.report(error));
  }

  bind<Event extends object>(EventClass: ClassType<Event> | null, token: Token<EventHandler<Event>>) {
    const handlerClass = this.container.resolve(token);
    const handler = handlerClass.handle.bind(handlerClass);

    this.addListener(EventClass, handler);
  }

  async waitForPromises() {
    while (this.promises.size > 0) {
      await Promise.all(this.promises.values());
    }
  }
}
