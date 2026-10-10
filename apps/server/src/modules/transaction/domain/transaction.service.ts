import { TransactionStatus } from '@sel/shared';
import { injectableClass } from 'ditox';

import { EventPublisher } from 'src/infrastructure/events';
import { BadRequest, Forbidden } from 'src/infrastructure/http';
import { Member } from 'src/modules/member';
import { Request } from 'src/modules/request/request.entities';

import {
  Transaction,
  TransactionCanceledEvent,
  TransactionCompletedEvent,
  TransactionCreatedEvent,
  TransactionPendingEvent,
} from '../transaction.entities';

export class TransactionService {
  static inject = injectableClass(this);

  createTransaction(params: {
    transactionId: string;
    payer: Member;
    recipient: Member;
    creator: Member;
    amount: number;
    description: string;
    comment?: string;
    request?: Request;
    eventId?: string;
    now: Date;
    publisher: EventPublisher;
  }): Transaction {
    const { transactionId, amount, description, comment, request, eventId } = params;
    const { payer, recipient, creator } = params;
    const { publisher, now } = params;

    if (payer.id === recipient.id) {
      throw new PayerIsRecipientError(payer.id);
    }

    if (creator.id !== payer.id && creator.id !== recipient.id) {
      throw new InvalidTransactionCreatorError(creator.id, payer.id, recipient.id);
    }

    if (amount <= 0) {
      throw new NegativeAmountError(amount);
    }

    if (request && request.requesterId !== payer.id) {
      throw new PayerIsNotRequesterError(request.id, payer.id, request.requesterId);
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
      requestId: request?.id ?? null,
      eventId: eventId ?? null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    if (creator.id === payer.id && comment !== undefined) {
      transaction.payerComment = comment;
    }

    if (creator.id === recipient.id && comment !== undefined) {
      transaction.recipientComment = comment;
    }

    publisher.publish(new TransactionCreatedEvent(transactionId));

    if (creator.id === payer.id) {
      this.completeTransaction({ transaction, payer, recipient, now, publisher });
    } else {
      publisher.publish(new TransactionPendingEvent(transactionId));
    }

    return transaction;
  }

  checkCanAcceptTransaction(params: { transaction: Transaction; memberId: string }) {
    const { transaction, memberId } = params;

    if (memberId !== transaction.payerId) {
      throw new MemberIsNotPayerError(transaction.id, memberId, transaction.payerId);
    }
  }

  completeTransaction(params: {
    transaction: Transaction;
    payer: Member;
    recipient: Member;
    now: Date;
    publisher: EventPublisher;
  }): void {
    const { transaction, payer, recipient, now, publisher } = params;

    if (transaction.status !== TransactionStatus.pending) {
      throw new TransactionIsNotPendingError(transaction.id, transaction.status);
    }

    transaction.status = TransactionStatus.completed;
    transaction.completedAt = now;
    payer.balance -= transaction.amount;
    recipient.balance += transaction.amount;

    publisher.publish(new TransactionCompletedEvent(transaction.id));
  }

  checkCanCancelTransaction(params: { transaction: Transaction; memberId: string }) {
    const { transaction, memberId } = params;

    if (memberId !== transaction.payerId) {
      throw new MemberIsNotPayerError(transaction.id, memberId, transaction.payerId);
    }
  }

  cancelTransaction(params: { transaction: Transaction; publisher: EventPublisher }): void {
    const { transaction, publisher } = params;

    if (transaction.status !== TransactionStatus.pending) {
      throw new TransactionIsNotPendingError(transaction.id, transaction.status);
    }

    transaction.status = TransactionStatus.canceled;

    publisher.publish(new TransactionCanceledEvent(transaction.id));
  }
}

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

export class PayerIsNotRequesterError extends BadRequest {
  constructor(requestId: string, payerId: string, requesterId: string) {
    super('The payer of a transaction linked to a request must be the requester', {
      requestId,
      payerId,
      requesterId,
    });
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
