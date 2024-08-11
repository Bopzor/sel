import { TransactionStatus } from '@sel/shared';
import { injectableClass } from 'ditox';

import { EventPublisherPort } from '../infrastructure/events/event-publisher.port';
import { Member } from '../members/member.entity';
import { TOKENS } from '../tokens';

import {
  InvalidTransactionCreatorError,
  MemberIsNotPayerError,
  NegativeAmountError,
  PayerIsRecipientError,
  TransactionIsNotPendingError,
} from './transaction-errors';
import { TransactionCanceled, TransactionCompleted, TransactionCreated } from './transaction-events';
import { Transaction } from './transaction.entity';

export class TransactionService {
  static inject = injectableClass(this, TOKENS.eventPublisher);

  constructor(private readonly eventPublisher: EventPublisherPort) {}

  createTransaction(params: {
    transactionId: string;
    payer: Member;
    recipient: Member;
    creator: Member;
    amount: number;
    description: string;
    now: Date;
  }): Transaction {
    const { transactionId, payer, recipient, creator, amount, description, now } = params;

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
      createdAt: now,
      updatedAt: now,
    };

    this.eventPublisher.publish(new TransactionCreated(transactionId));

    if (creator.id === payer.id) {
      this.completeTransaction({ transaction, payer, recipient });
    }

    return transaction;
  }

  checkCanAcceptTransaction(params: { transaction: Transaction; memberId: string }) {
    const { transaction, memberId } = params;

    if (memberId !== transaction.payerId) {
      throw new MemberIsNotPayerError(transaction.id, memberId, transaction.payerId);
    }
  }

  completeTransaction(params: { transaction: Transaction; payer: Member; recipient: Member }): void {
    const { transaction, payer, recipient } = params;

    if (transaction.status !== TransactionStatus.pending) {
      throw new TransactionIsNotPendingError(transaction.id, transaction.status);
    }

    transaction.status = TransactionStatus.completed;
    payer.balance -= transaction.amount;
    recipient.balance += transaction.amount;

    this.eventPublisher.publish(new TransactionCompleted(transaction.id));
  }

  checkCanCancelTransaction(params: { transaction: Transaction; memberId: string }) {
    const { transaction, memberId } = params;

    if (memberId !== transaction.payerId) {
      throw new MemberIsNotPayerError(transaction.id, memberId, transaction.payerId);
    }
  }

  cancelTransaction(params: { transaction: Transaction }): void {
    const { transaction } = params;

    if (transaction.status !== TransactionStatus.pending) {
      throw new TransactionIsNotPendingError(transaction.id, transaction.status);
    }

    transaction.status = TransactionStatus.canceled;

    this.eventPublisher.publish(new TransactionCanceled(transaction.id));
  }
}
