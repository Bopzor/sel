import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { TOKENS } from '../../tokens';
import { DatePort } from '../date/date.port';
import { GeneratorPort } from '../generator/generator.port';
import { Database } from '../persistence/database';
import { events } from '../persistence/schema';

import { EventsPort } from './events.port';

export class EventsPersistor {
  static inject = injectableClass(this, TOKENS.events, TOKENS.generator, TOKENS.date, TOKENS.database);

  constructor(
    private readonly events: EventsPort,
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly database: Database
  ) {}

  init() {
    this.events.addAnyEventListener(this.persistEvent.bind(this));
  }

  async persistEvent(event: DomainEvent) {
    const now = this.dateAdapter.now();

    const { entity, entityId, type, ...payload } = event;

    await this.database.db.insert(events).values({
      id: this.generator.id(),
      entity,
      entityId,
      type,
      payload,
      createdAt: now,
    });
  }
}
