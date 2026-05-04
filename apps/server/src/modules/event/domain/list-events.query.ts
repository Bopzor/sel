import { getId } from '@sel/utils';
import { and, desc, eq, gte, ilike, inArray, lt, or, SQL, sql } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db, nullsFirst, paginated, schema } from 'src/persistence';

type ListEventsQuery = {
  search?: string;
  timing?: 'past' | 'upcoming';
  organizerId?: string;
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
    conditions.push(gte(schema.events.date, new Date()));
  }

  if (query.timing === 'past') {
    conditions.push(lt(schema.events.date, new Date()));
  }

  if (query.organizerId) {
    conditions.push(eq(schema.events.organizerId, query.organizerId));
  }

  if (query.year) {
    conditions.push(eq(sql`EXTRACT(YEAR FROM ${schema.events.date})`, query.year));
  }

  const [total, ids] = await paginated(
    query,
    db
      .select({ id: schema.events.id })
      .from(schema.events)
      .leftJoin(schema.messages, eq(schema.events.messageId, schema.messages.id))
      .where(and(...conditions))
      .orderBy(nullsFirst(desc(schema.events.date)))
      .$dynamic(),
  );

  return {
    total,
    events: await db.query.events.findMany({
      where: inArray(schema.events.id, ids.map(getId)),
      with: {
        organizer: withAvatar,
        message: withAttachments,
      },
      orderBy: ({ date }, { desc }) => nullsFirst(desc(date)),
    }),
  };
}
