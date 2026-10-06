import { getId } from '@sel/utils';
import { and, desc, eq, ilike, or, SQL } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { withAttachments } from 'src/modules/messages/message.entities';
import { db, paginated, schema } from 'src/persistence';

type ListInformationQuery = {
  search?: string;
  authorId?: string;
  page: number;
  pageSize: number;
};

export async function listInformation(query: ListInformationQuery) {
  const conditions = new Array<SQL>();

  if (query.search) {
    conditions.push(
      or(
        ilike(schema.information.title, `%${query.search}%`),
        ilike(schema.messages.text, `%${query.search}%`),
      )!,
    );
  }

  if (query.authorId) {
    conditions.push(eq(schema.information.authorId, query.authorId));
  }

  const [total, ids] = await paginated(
    query,
    db
      .select({ id: schema.information.id })
      .from(schema.information)
      .leftJoin(schema.messages, eq(schema.information.messageId, schema.messages.id))
      .where(and(...conditions))
      .orderBy(desc(schema.information.publishedAt))
      .$dynamic(),
  );

  return {
    total,
    information: await db.query.information.findMany({
      where: { id: { in: ids.map(getId) } },
      with: {
        author: withAvatar,
        message: withAttachments,
      },
      orderBy: ({ publishedAt }, { desc }) => desc(publishedAt),
    }),
  };
}
