import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { findMemberById } from 'src/modules/member';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

export type AcceptTransactionCommand = {
  transactionId: string;
  memberId: string;
};

export async function acceptTransaction(command: AcceptTransactionCommand): Promise<void> {
  const now = container.resolve(TOKENS.date).now();
  const transactionService = container.resolve(TOKENS.transactionService);

  const { transactionId, memberId } = command;

  const transaction = await db.query.transactions.findFirst({
    where: eq(schema.transactions.id, transactionId),
  });

  if (!transaction) {
    throw new NotFound('Transaction not found');
  }

  const payer = defined(await findMemberById(transaction.payerId));
  const recipient = defined(await findMemberById(transaction.recipientId));

  transactionService.checkCanAcceptTransaction({ transaction, memberId });

  transactionService.completeTransaction({
    transaction,
    payer,
    recipient,
  });

  await db
    .update(schema.transactions)
    .set({ ...transaction, updatedAt: now })
    .where(eq(schema.transactions.id, transaction.id));

  for (const { id, balance } of [payer, recipient]) {
    await db
      .update(schema.members)
      .set({ balance: balance, updatedAt: now })
      .where(eq(schema.members.id, id));
  }
}
