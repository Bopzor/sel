import { EventBus as BaseEventBus } from '@sel/cqs';
import { ClassType } from '@sel/utils';
import { Token, injectableClass } from 'ditox';

import { container } from '../../container';
import { TOKENS } from '../../tokens';
import { ErrorReporterPort } from '../error-reporter/error-reporter.port';

import { EventHandler } from './event-handler';

export class EventBus extends BaseEventBus {
  static inject = injectableClass(this, TOKENS.errorReporter);

  constructor(errorReporter: ErrorReporterPort) {
    super((error) => errorReporter.report(error));
  }

  bind<Event extends object>(EventClass: ClassType<Event> | null, token: Token<EventHandler<Event>>) {
    const handlerClass = container.resolve(token);
    const handler = handlerClass.handle.bind(handlerClass);

    this.addListener(EventClass, handler);
  }
}
