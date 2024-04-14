import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { Event } from '../../../events/event.entity';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { events } from '../../schema';

import { EventRepository } from './event.repository';

export class SqlEventRepository implements EventRepository {
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {}

  async getEvent(eventId: string): Promise<Event | undefined> {
    return this.database.db.query.events.findFirst({ where: eq(events.id, eventId) });
  }
}
