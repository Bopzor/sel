import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

export type CancelTransactionCommand = {
  transactionId: string;
  memberId: string;
};

export async function cancelTransaction(command: CancelTransactionCommand): Promise<void> {
  const { transactionId, memberId } = command;

  const now = container.resolve(TOKENS.date).now();
  const transactionService = container.resolve(TOKENS.transactionService);

  const transaction = await db.query.transactions.findFirst({
    where: eq(schema.transactions.id, transactionId),
  });

  if (!transaction) {
    throw new NotFound('Transaction not found');
  }

  transactionService.checkCanCancelTransaction({ transaction, memberId });
  transactionService.cancelTransaction({ transaction });

  await db
    .update(schema.transactions)
    .set({ ...transaction, updatedAt: now })
    .where(eq(schema.transactions.id, transaction.id));
}
