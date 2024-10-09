import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { asc } from '../../persistence/utils';
import { TOKENS } from '../../tokens';

export type ListEventsQuery = Record<string, never>;

export type ListEventsQueryResult = shared.EventsListItem[];

export class ListEvents implements QueryHandler<ListEventsQuery, ListEventsQueryResult> {
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {}

  async handle(): Promise<ListEventsQueryResult> {
    const events = await this.database.db.query.events.findMany({
      orderBy: [asc(schema.events.date, { nulls: 'first' })],
      with: {
        organizer: true,
      },
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date?.toISOString() ?? undefined,
      kind: event.kind as shared.EventKind,
      organizer: this.serializeOrganizer(event.organizer),
    }));
  }

  private serializeOrganizer(organizer: typeof schema.members.$inferSelect): shared.EventOrganizer {
    return {
      id: organizer.id,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      email: organizer.emailVisible ? organizer.email : undefined,
      phoneNumbers: (organizer.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
    };
  }
}
