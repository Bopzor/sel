import * as shared from '@sel/shared';
import { and, count, eq, or, sql } from 'drizzle-orm';

import { db, schema } from 'src/persistence';

export async function getMemberTransactionStats(memberId: string): Promise<shared.MemberTransactionStats> {
  const { transactions } = schema;
  const { payerId, recipientId, amount } = transactions;

  const [stats] = await db
    .select({
      given: sql`coalesce(sum(${amount}) filter (where ${payerId} = ${memberId}), 0)`.mapWith(Number),
      received: sql`coalesce(sum(${amount}) filter (where ${recipientId} = ${memberId}), 0)`.mapWith(Number),
      count: count(),
      partners:
        sql`count(distinct case when ${payerId} = ${memberId} then ${recipientId} else ${payerId} end)`.mapWith(
          Number,
        ),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, shared.TransactionStatus.completed),
        or(eq(payerId, memberId), eq(recipientId, memberId)),
      ),
    );

  return stats;
}
