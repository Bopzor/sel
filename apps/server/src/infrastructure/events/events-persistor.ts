import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { Database } from '../../persistence/database';
import { events } from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventHandler } from '../cqs/event-handler';
import { DatePort } from '../date/date.port';
import { GeneratorPort } from '../generator/generator.port';

export class EventsPersistor implements EventHandler<DomainEvent> {
  static inject = injectableClass(this, TOKENS.generator, TOKENS.date, TOKENS.database);

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
  ) {}

  async handle(event: DomainEvent) {
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
