import { TransactionStatus } from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { BadRequest, Forbidden } from 'src/infrastructure/http';
import { Member } from 'src/modules/member';
import { TOKENS } from 'src/tokens';

import {
  Transaction,
  TransactionCanceled,
  TransactionCompleted,
  TransactionCreated,
  TransactionPending,
} from '../transaction.entities';

export class PayerIsRecipientError extends BadRequest {
  constructor(id: string) {
    super('The payer and the recipient cannot be equal', { payerId: id, recipientId: id });
  }
}

export class InvalidTransactionCreatorError extends BadRequest {
  constructor(creatorId: string, payerId: string, recipientId: string) {
    super('The creator must be either the payer or the recipient', { creatorId, payerId, recipientId });
  }
}

export class NegativeAmountError extends BadRequest {
  constructor(amount: number) {
    super('The amount must be greater than zero', { amount });
  }
}

export class MemberIsNotPayerError extends Forbidden {
  constructor(transactionId: string, memberId: string, payerId: string) {
    super('Member must be the payer to accept or cancel the transaction', {
      transactionId,
      memberId,
      payerId,
    });
  }
}

export class TransactionIsNotPendingError extends BadRequest {
  constructor(transactionId: string, status: TransactionStatus) {
    super('Transaction status must be pending', { transactionId, status });
  }
}

export function createTransaction(params: {
  transactionId: string;
  payer: Member;
  recipient: Member;
  creator: Member;
  amount: number;
  description: string;
  requestId?: string;
  eventId?: string;
  now: Date;
}): Transaction {
  const { transactionId, payer, recipient, creator, amount, description, requestId, eventId, now } = params;
  const events = container.resolve(TOKENS.events);

  if (payer.id === recipient.id) {
    throw new PayerIsRecipientError(payer.id);
  }

  if (creator.id !== payer.id && creator.id !== recipient.id) {
    throw new InvalidTransactionCreatorError(creator.id, payer.id, recipient.id);
  }

  if (amount <= 0) {
    throw new NegativeAmountError(amount);
  }

  const transaction: Transaction = {
    id: transactionId,
    status: TransactionStatus.pending,
    description,
    amount,
    payerId: payer.id,
    recipientId: recipient.id,
    creatorId: creator.id,
    payerComment: null,
    recipientComment: null,
    requestId: requestId ?? null,
    // eventId: eventId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  events.publish(new TransactionCreated(transactionId));

  if (creator.id === payer.id) {
    completeTransaction({ transaction, payer, recipient });
  } else {
    events.publish(new TransactionPending(transactionId));
  }

  return transaction;
}

export function checkCanAcceptTransaction(params: { transaction: Transaction; memberId: string }) {
  const { transaction, memberId } = params;

  if (memberId !== transaction.payerId) {
    throw new MemberIsNotPayerError(transaction.id, memberId, transaction.payerId);
  }
}

export function completeTransaction(params: {
  transaction: Transaction;
  payer: Member;
  recipient: Member;
}): void {
  const { transaction, payer, recipient } = params;
  const events = container.resolve(TOKENS.events);

  if (transaction.status !== TransactionStatus.pending) {
    throw new TransactionIsNotPendingError(transaction.id, transaction.status);
  }

  transaction.status = TransactionStatus.completed;
  payer.balance -= transaction.amount;
  recipient.balance += transaction.amount;

  events.publish(new TransactionCompleted(transaction.id));
}

export function checkCanCancelTransaction(params: { transaction: Transaction; memberId: string }) {
  const { transaction, memberId } = params;

  if (memberId !== transaction.payerId) {
    throw new MemberIsNotPayerError(transaction.id, memberId, transaction.payerId);
  }
}

export function cancelTransaction(params: { transaction: Transaction }): void {
  const { transaction } = params;
  const events = container.resolve(TOKENS.events);

  if (transaction.status !== TransactionStatus.pending) {
    throw new TransactionIsNotPendingError(transaction.id, transaction.status);
  }

  transaction.status = TransactionStatus.canceled;

  events.publish(new TransactionCanceled(transaction.id));
}
