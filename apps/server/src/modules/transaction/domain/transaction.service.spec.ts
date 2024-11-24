import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubEvents } from 'src/infrastructure/events';
import { Member } from 'src/modules/member';

import {
  Transaction,
  TransactionCanceledEvent,
  TransactionCompletedEvent,
  TransactionCreatedEvent,
  TransactionPendingEvent,
} from '../transaction.entities';

import {
  InvalidTransactionCreatorError,
  MemberIsNotPayerError,
  NegativeAmountError,
  PayerIsRecipientError,
  TransactionIsNotPendingError,
  TransactionService,
} from './transaction.service';

describe('transactions service', () => {
  let publisher: StubEvents;
  let service: TransactionService;

  const now = new Date();

  const defaultTransaction = {
    transactionId: 'transactionId',
    amount: 1,
    description: '',
    now,
  };

  beforeEach(() => {
    publisher = new StubEvents();
    service = new TransactionService(publisher);
  });

  const createMember = createFactory<Member>(() => ({
    id: createId(),
    status: shared.MemberStatus.active,
    firstName: '',
    lastName: '',
    email: '',
    emailVisible: true,
    address: null,
    bio: null,
    phoneNumbers: [],
    avatarId: null,
    notificationDelivery: [],
    balance: 0,
    membershipStartDate: createDate(),
    createdAt: createDate(),
    updatedAt: createDate(),
  }));

  const createTransaction = createFactory<Transaction>(() => ({
    id: createId(),
    status: shared.TransactionStatus.pending,
    description: '',
    amount: 0,
    payerId: '',
    recipientId: '',
    payerComment: '',
    recipientComment: '',
    creatorId: '',
    requestId: '',
    eventId: '',
    createdAt: createDate(),
    updatedAt: createDate(),
  }));

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
    expect(transaction.status).toEqual(shared.TransactionStatus.completed);
    expect(payer.balance).toEqual(0);
    expect(recipient.balance).toEqual(2);

    expect(publisher.events).toContainEqual(new TransactionCreatedEvent('transactionId'));
    expect(publisher.events).toContainEqual(new TransactionCompletedEvent('transactionId'));
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
    expect(transaction.status).toEqual(shared.TransactionStatus.pending);
    expect(payer.balance).toEqual(1);
    expect(recipient.balance).toEqual(1);

    expect(publisher.events).toContainEqual(new TransactionCreatedEvent('transactionId'));
    expect(publisher.events).toContainEqual(new TransactionPendingEvent('transactionId'));
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

    expect(transaction.status).toEqual(shared.TransactionStatus.completed);
    expect(payer.balance).toEqual(0);
    expect(recipient.balance).toEqual(2);

    expect(publisher.events).toContainEqual(new TransactionCompletedEvent('transactionId'));
  });

  it('cancels a transaction as a payer', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = service.createTransaction({
      ...defaultTransaction,
      payer,
      recipient,
      creator: recipient,
      amount: 1,
    });

    service.cancelTransaction({ transaction });

    expect(transaction.status).toEqual(shared.TransactionStatus.canceled);
    expect(payer.balance).toEqual(1);
    expect(recipient.balance).toEqual(1);

    expect(publisher.events).toContainEqual(new TransactionCanceledEvent('transactionId'));
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
      status: shared.TransactionStatus.completed,
    });

    expect(() => {
      service.completeTransaction({
        transaction,
        payer: createMember(),
        recipient: createMember(),
      });
    }).toThrow(new TransactionIsNotPendingError('transactionId', shared.TransactionStatus.completed));
  });

  it('prevents to cancel a transaction if not payer', () => {
    const transaction = createTransaction({
      payerId: 'payerId',
      recipientId: 'recipientId',
      creatorId: 'recipientId',
    });

    expect(() => {
      service.checkCanCancelTransaction({
        transaction,
        memberId: 'recipientId',
      });
    }).toThrow(new MemberIsNotPayerError('transactionId', 'recipientId', 'payerId'));
  });

  it('prevents to cancel a transaction that is not pending', () => {
    const transaction = createTransaction({
      status: shared.TransactionStatus.completed,
    });

    expect(() => {
      service.cancelTransaction({ transaction });
    }).toThrow(new TransactionIsNotPendingError('transactionId', shared.TransactionStatus.completed));
  });
});
