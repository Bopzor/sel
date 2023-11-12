import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { TOKENS } from '../../tokens';
import { LoggerPort } from '../logger/logger.port';

import { EventsPort } from './events.port';

export class EventsLogger {
  static inject = injectableClass(this, TOKENS.events, TOKENS.logger);

  constructor(private readonly events: EventsPort, private readonly logger: LoggerPort) {}

  init() {
    this.events.addAnyEventListener(this.logEvent.bind(this));
  }

  async logEvent(event: DomainEvent) {
    this.logger.info(event);
  }
}
