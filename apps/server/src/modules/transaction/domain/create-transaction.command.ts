import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { findMemberById } from 'src/modules/member';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

export type CreateTransactionCommand = {
  transactionId: string;
  payerId: string;
  recipientId: string;
  creatorId: string;
  amount: number;
  description: string;
  requestId?: string;
  eventId?: string;
};

export async function createTransaction(command: CreateTransactionCommand): Promise<void> {
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);
  const transactionService = container.resolve(TOKENS.transactionService);

  const { transactionId, payerId, recipientId, creatorId, amount, description, requestId, eventId } = command;

  const payer = await findMemberById(payerId);
  const recipient = await findMemberById(recipientId);

  if (!payer) {
    throw new NotFound('Payer not found', { payerId });
  }

  if (!recipient) {
    throw new NotFound('Recipient not found', { recipientId });
  }

  const creator = creatorId === payerId ? payer : recipient;

  const publisher = events.publisher();

  const transaction = transactionService.createTransaction({
    transactionId,
    payer,
    recipient,
    creator,
    amount,
    description,
    requestId,
    eventId,
    now,
    publisher,
  });

  await db.transaction(async (tx) => {
    await tx.insert(schema.transactions).values(transaction);

    for (const { id, balance } of [payer, recipient]) {
      await tx.update(schema.members).set({ updatedAt: now, balance }).where(eq(schema.members.id, id));
    }
  });

  publisher.commit();
}
