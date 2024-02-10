import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { TOKENS } from '../../tokens';
import { EventHandler } from '../cqs/event-handler';
import { DatePort } from '../date/date.port';
import { LoggerPort } from '../logger/logger.port';

export class EventsLogger implements EventHandler<DomainEvent> {
  static inject = injectableClass(this, TOKENS.date, TOKENS.logger);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly logger: LoggerPort,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const now = this.dateAdapter.now().toISOString();
    const { type, entity, entityId, ...payload } = event;

    this.logger.info(`[${now}] [${entity}]`, type, entityId, JSON.stringify(payload));
  }
}
