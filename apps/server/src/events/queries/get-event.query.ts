import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';

export type GetEventQuery = {
  eventId: string;
};

export type GetEventQueryResult = shared.Event | undefined;

export class GetEvent implements QueryHandler<GetEventQuery, GetEventQueryResult> {
  static inject = injectableClass(this, TOKENS.database);

  constructor(private readonly database: Database) {}

  async handle({ eventId }: GetEventQuery): Promise<GetEventQueryResult> {
    const event = await this.database.db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
      with: {
        organizer: true,
        participants: {
          with: {
            member: true,
          },
        },
        comments: {
          with: {
            author: true,
          },
        },
      },
    });

    if (!event) {
      return;
    }

    return {
      id: event.id,
      title: event.title,
      body: event.html,
      kind: event.kind as shared.EventKind,
      date: event.date?.toISOString() ?? undefined,
      location: event.location ?? undefined,
      organizer: this.serializeOrganizer(event.organizer),
      participants: event.participants.map(({ member, participation }) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        participation,
      })),
      comments: event.comments.map((comment) => ({
        id: comment.id,
        date: comment.date.toISOString(),
        author: {
          id: comment.author.id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
        },
        body: comment.html,
      })),
    };
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
