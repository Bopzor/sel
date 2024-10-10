import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import {
  checkCanCancelTransaction,
  cancelTransaction as cancelTransactionEntity,
} from './transaction.service';

export type CancelTransactionCommand = {
  transactionId: string;
  memberId: string;
};

export async function cancelTransaction(command: CancelTransactionCommand): Promise<void> {
  const now = container.resolve(TOKENS.date).now();
  const { transactionId, memberId } = command;

  const transaction = await db.query.transactions.findFirst({
    where: eq(schema.transactions.id, transactionId),
  });

  if (!transaction) {
    throw new NotFound('Transaction not found');
  }

  checkCanCancelTransaction({ transaction, memberId });

  cancelTransactionEntity({ transaction });

  await db
    .update(schema.transactions)
    .set({ ...transaction, updatedAt: now })
    .where(eq(schema.transactions.id, transaction.id));
}
