import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { TOKENS } from '../../tokens';
import { DatePort } from '../date/date.port';
import { LoggerPort } from '../logger/logger.port';

import { EventsPort } from './events.port';

export class EventsLogger {
  static inject = injectableClass(this, TOKENS.date, TOKENS.events, TOKENS.logger);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly logger: LoggerPort
  ) {}

  init() {
    this.events.addAnyEventListener(this.logEvent.bind(this));
  }

  async logEvent(event: DomainEvent) {
    const now = this.dateAdapter.now().toISOString();
    const { type, entity, entityId, ...payload } = event;

    this.logger.info(`[${now}] [${entity}]`, type, entityId, JSON.stringify(payload));
  }
}
