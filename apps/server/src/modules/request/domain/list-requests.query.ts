import { RequestStatus } from '@sel/shared';
import { getId } from '@sel/utils';
import { and, desc, eq, ilike, inArray, or, SQL, sql } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db, paginated, schema } from 'src/persistence';

type ListRequestsQuery = {
  search?: string;
  status?: RequestStatus;
  requesterId?: string;
  year?: number;
  page: number;
  pageSize: number;
};

export async function listRequests(query: ListRequestsQuery) {
  const conditions = new Array<SQL>();

  if (query.search) {
    conditions.push(
      or(
        ilike(schema.requests.title, `%${query.search}%`),
        ilike(schema.messages.text, `%${query.search}%`),
      )!,
    );
  }

  if (query.status) {
    conditions.push(eq(schema.requests.status, query.status));
  }

  if (query.requesterId) {
    conditions.push(eq(schema.requests.requesterId, query.requesterId));
  }

  if (query.year) {
    conditions.push(eq(sql`EXTRACT(YEAR FROM ${schema.requests.createdAt})`, query.year));
  }

  const [total, ids] = await paginated(
    query,
    db
      .select({ id: schema.requests.id })
      .from(schema.requests)
      .leftJoin(schema.messages, eq(schema.requests.messageId, schema.messages.id))
      .where(and(...conditions))
      .orderBy(desc(schema.requests.createdAt))
      .$dynamic(),
  );

  return {
    total,
    requests: await db.query.requests.findMany({
      where: inArray(schema.requests.id, ids.map(getId)),
      with: {
        requester: withAvatar,
        message: withAttachments,
      },
      orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    }),
  };
}
