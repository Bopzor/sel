import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { TransactionInsert } from './transaction.entities';

export async function findTransactionById(transactionId: string) {
  return db.query.transactions.findFirst({
    where: eq(schema.transactions.id, transactionId),
  });
}

export async function updateTransaction(transactionId: string, values: Partial<TransactionInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  return db
    .update(schema.transactions)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.transactions.id, transactionId));
}
