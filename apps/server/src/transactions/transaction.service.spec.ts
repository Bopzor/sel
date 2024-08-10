import { TransactionStatus } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventPublisher } from '../infrastructure/events/stub-event-publisher';
import { createMember } from '../members/member.entity';

import {
  InvalidTransactionCreatorError,
  MemberIsNotPayerError,
  NegativeAmountError,
  PayerIsRecipientError,
  TransactionIsNotPendingError,
} from './transaction-errors';
import { TransactionCompleted, TransactionCreated } from './transaction-events';
import { createTransaction } from './transaction.entity';
import { TransactionService } from './transaction.service';

describe('[Unit] TransactionService', () => {
  let publisher: StubEventPublisher;
  let service: TransactionService;

  const now = new Date();

  const defaultTransaction = {
    transactionId: 'transactionId',
    amount: 1,
    description: '',
    now,
  };

  beforeEach(() => {
    publisher = new StubEventPublisher();
    service = new TransactionService(publisher);
  });

  it('creates a transaction as a payer', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = service.createTransaction({
      ...defaultTransaction,
      payer,
      recipient,
      creator: payer,
      amount: 1,
    });

    expect(transaction.id).toEqual('transactionId');
    expect(transaction.status).toEqual(TransactionStatus.completed);
    expect(payer.balance).toEqual(0);
    expect(recipient.balance).toEqual(2);

    expect(publisher.events).toContainEqual(new TransactionCreated('transactionId'));
    expect(publisher.events).toContainEqual(new TransactionCompleted('transactionId'));
  });

  it('creates a transaction as a recipient', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = service.createTransaction({
      ...defaultTransaction,
      payer,
      recipient,
      creator: recipient,
      amount: 1,
    });

    expect(transaction.id).toEqual('transactionId');
    expect(transaction.status).toEqual(TransactionStatus.pending);
    expect(payer.balance).toEqual(1);
    expect(recipient.balance).toEqual(1);

    expect(publisher.events).toContainEqual(new TransactionCreated('transactionId'));
  });

  it('completes a transaction as a payer', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = service.createTransaction({
      ...defaultTransaction,
      payer,
      recipient,
      creator: recipient,
      amount: 1,
    });

    service.completeTransaction({
      transaction,
      payer,
      recipient,
    });

    expect(transaction.status).toEqual(TransactionStatus.completed);
    expect(payer.balance).toEqual(0);
    expect(recipient.balance).toEqual(2);

    expect(publisher.events).toContainEqual(new TransactionCompleted('transactionId'));
  });

  it('prevents to create a transaction with the payer as recipient', () => {
    const payer = createMember();

    expect(() => {
      service.createTransaction({ ...defaultTransaction, payer, recipient: payer, creator: payer });
    }).toThrow(new PayerIsRecipientError(payer.id));
  });

  it('prevents to create a transaction when creator is not payer or recipient', () => {
    const payer = createMember();
    const recipient = createMember();
    const creator = createMember();

    expect(() => {
      service.createTransaction({ ...defaultTransaction, payer, recipient, creator });
    }).toThrow(new InvalidTransactionCreatorError(creator.id, payer.id, recipient.id));
  });

  it('prevents to create a transaction with a negative amount', () => {
    const payer = createMember();
    const recipient = createMember();

    expect(() => {
      service.createTransaction({ ...defaultTransaction, payer, recipient, creator: payer, amount: -1 });
    }).toThrow(new NegativeAmountError(-1));
  });

  it('prevents to create a transaction with a null amount', () => {
    const payer = createMember();
    const recipient = createMember();

    expect(() => {
      service.createTransaction({ ...defaultTransaction, payer, recipient, creator: payer, amount: 0 });
    }).toThrow(new NegativeAmountError(0));
  });

  it('prevents to accept a transaction if not payer', () => {
    const transaction = createTransaction({
      payerId: 'payerId',
      recipientId: 'recipientId',
      creatorId: 'recipientId',
    });

    expect(() => {
      service.checkCanAcceptTransaction({
        transaction,
        memberId: 'recipientId',
      });
    }).toThrow(new MemberIsNotPayerError('transactionId', 'recipientId', 'payerId'));
  });

  it('prevents to complete a transaction that is not pending', () => {
    const transaction = createTransaction({
      status: TransactionStatus.completed,
    });

    expect(() => {
      service.completeTransaction({
        transaction,
        payer: createMember(),
        recipient: createMember(),
      });
    }).toThrow(new TransactionIsNotPendingError('transactionId', TransactionStatus.completed));
  });
});
