import * as shared from '@sel/shared';
import { getId } from '@sel/utils';
import { and, desc, eq, or, sql, SQL } from 'drizzle-orm';

import { withAvatar } from 'src/modules/member/member.entities';
import { db, paginated, schema } from 'src/persistence';

type ListMemberTransactionsQuery = {
  memberId: string;
  status?: shared.TransactionStatus;
  counterpartId?: string;
  page?: number;
  pageSize: number;
};

export async function listMemberTransactions(query: ListMemberTransactionsQuery) {
  const { transactions } = schema;

  const conditions: SQL[] = [
    or(eq(transactions.payerId, query.memberId), eq(transactions.recipientId, query.memberId))!,
  ];

  if (query.status) {
    conditions.push(eq(transactions.status, query.status));
  }

  if (query.counterpartId) {
    conditions.push(
      or(eq(transactions.payerId, query.counterpartId), eq(transactions.recipientId, query.counterpartId))!,
    );
  }

  const orderBy = ({ status, completedAt, createdAt }: typeof schema.transactions) => [
    desc(eq(status, shared.TransactionStatus.pending)),
    desc(sql`coalesce(${completedAt}, ${createdAt})`),
    desc(createdAt),
  ];

  const select = db
    .select({ id: transactions.id })
    .from(transactions)
    .where(and(...conditions))
    .orderBy(...orderBy(transactions))
    .$dynamic();

  const [total, ids] =
    query.page === undefined
      ? [undefined, await select]
      : await paginated({ page: query.page, pageSize: query.pageSize }, select);

  return {
    total,
    transactions: await db.query.transactions.findMany({
      where: { id: { in: ids.map(getId) } },
      with: {
        payer: withAvatar,
        recipient: withAvatar,
        request: true,
      },
      orderBy,
    }),
  };
}
