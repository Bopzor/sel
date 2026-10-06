import { getId } from '@sel/utils';
import { and, asc, desc, eq, exists, gte, ilike, isNull, lt, or, SQL, sql } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db, nullsFirst, paginated, schema } from 'src/persistence';

type ListEventsQuery = {
  search?: string;
  timing?: 'past' | 'upcoming';
  organizerId?: string;
  participantId?: string;
  includeUndated?: boolean;
  year?: number;
  page: number;
  pageSize: number;
};

export async function listEvents(query: ListEventsQuery) {
  const conditions = new Array<SQL>();

  if (query.search) {
    conditions.push(
      or(ilike(schema.events.title, `%${query.search}%`), ilike(schema.messages.text, `%${query.search}%`))!,
    );
  }

  if (query.timing === 'upcoming') {
    const upcoming = gte(schema.events.date, new Date());
    conditions.push(query.includeUndated ? or(upcoming, isNull(schema.events.date))! : upcoming);
  }

  if (query.timing === 'past') {
    conditions.push(lt(schema.events.date, new Date()));
  }

  if (query.organizerId) {
    conditions.push(eq(schema.events.organizerId, query.organizerId));
  }

  if (query.participantId) {
    conditions.push(
      exists(
        db
          .select()
          .from(schema.eventParticipations)
          .where(
            and(
              eq(schema.eventParticipations.eventId, schema.events.id),
              eq(schema.eventParticipations.participantId, query.participantId),
              eq(schema.eventParticipations.participation, 'yes'),
            ),
          ),
      ),
    );
  }

  if (query.year) {
    conditions.push(eq(sql`EXTRACT(YEAR FROM ${schema.events.date})`, query.year));
  }

  // The events without a date are tied: the creation date keeps their order stable across the pages.
  const orderBy = ({ date, createdAt }: typeof schema.events) => {
    return [query.timing === 'upcoming' ? asc(date) : nullsFirst(desc(date)), desc(createdAt)];
  };

  const [total, ids] = await paginated(
    query,
    db
      .select({ id: schema.events.id })
      .from(schema.events)
      .leftJoin(schema.messages, eq(schema.events.messageId, schema.messages.id))
      .where(and(...conditions))
      .orderBy(...orderBy(schema.events))
      .$dynamic(),
  );

  return {
    total,
    events: await db.query.events.findMany({
      where: { id: { in: ids.map(getId) } },
      with: {
        organizer: withAvatar,
        message: withAttachments,
        participants: true,
      },
      orderBy,
    }),
  };
}
