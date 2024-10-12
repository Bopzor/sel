import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { findMemberById, updateMember } from 'src/modules/member';
import { TOKENS } from 'src/tokens';

import { insertTransaction } from '../transaction.persistence';

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
  const transactionService = container.resolve(TOKENS.transactionService);

  const { transactionId, payerId, recipientId, creatorId, amount, description, requestId, eventId } = command;

  const payer = await findMemberById(payerId);
  const recipient = await findMemberById(recipientId);

  if (!payer) {
    throw new NotFound('Payer not found');
  }

  if (!recipient) {
    throw new NotFound('Recipient not found');
  }

  const creator = creatorId === payerId ? payer : recipient;

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
  });

  await insertTransaction(transaction);

  for (const { id, balance } of [payer, recipient]) {
    await updateMember(id, { balance });
  }
}
