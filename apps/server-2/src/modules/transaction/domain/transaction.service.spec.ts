import { TransactionStatus } from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { Member } from 'src/modules/member';
import { MemberStatus } from 'src/modules/member/member.entities';
import { TOKENS } from 'src/tokens';

import {
  TransactionCreated,
  TransactionCompleted,
  TransactionPending,
  TransactionCanceled,
  Transaction,
} from '../transaction.entities';

import {
  cancelTransaction,
  checkCanAcceptTransaction,
  checkCanCancelTransaction,
  completeTransaction,
  createTransaction,
  InvalidTransactionCreatorError,
  MemberIsNotPayerError,
  NegativeAmountError,
  PayerIsRecipientError,
  TransactionIsNotPendingError,
} from './transaction.service';

describe('transaction', () => {
  const now = new Date();
  let events: StubEvents;

  beforeEach(() => {
    events = new StubEvents();
    container.bindValue(TOKENS.events, events);
  });

  const createMember = createFactory<Member>(() => ({
    id: createId(),
    status: MemberStatus.active,
    firstName: '',
    lastName: '',
    email: '',
    emailVisible: true,
    address: null,
    bio: null,
    phoneNumbers: [],
    notificationDelivery: [],
    balance: 0,
    membershipStartDate: createDate(),
    createdAt: createDate(),
    updatedAt: createDate(),
  }));

  const createTransactionEntity = createFactory<Transaction>(() => ({
    id: createId(),
    status: TransactionStatus.pending,
    description: '',
    amount: 0,
    payerId: '',
    recipientId: '',
    payerComment: '',
    recipientComment: '',
    creatorId: '',
    requestId: '',
    // eventId: '',
    createdAt: createDate(),
    updatedAt: createDate(),
  }));

  const defaultTransaction = {
    transactionId: 'transactionId',
    amount: 1,
    description: '',
    now,
  };

  it('creates a transaction as a payer', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = createTransaction({
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

    expect(events.events).toContainEqual(new TransactionCreated('transactionId'));
    expect(events.events).toContainEqual(new TransactionCompleted('transactionId'));
  });

  it('creates a transaction as a recipient', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = createTransaction({
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

    expect(events.events).toContainEqual(new TransactionCreated('transactionId'));
    expect(events.events).toContainEqual(new TransactionPending('transactionId'));
  });

  it('completes a transaction as a payer', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = createTransaction({
      ...defaultTransaction,
      payer,
      recipient,
      creator: recipient,
      amount: 1,
    });

    completeTransaction({
      transaction,
      payer,
      recipient,
    });

    expect(transaction.status).toEqual(TransactionStatus.completed);
    expect(payer.balance).toEqual(0);
    expect(recipient.balance).toEqual(2);

    expect(events.events).toContainEqual(new TransactionCompleted('transactionId'));
  });

  it('cancels a transaction as a payer', () => {
    const payer = createMember({ balance: 1 });
    const recipient = createMember({ balance: 1 });

    const transaction = createTransaction({
      ...defaultTransaction,
      payer,
      recipient,
      creator: recipient,
      amount: 1,
    });

    cancelTransaction({ transaction });

    expect(transaction.status).toEqual(TransactionStatus.canceled);
    expect(payer.balance).toEqual(1);
    expect(recipient.balance).toEqual(1);

    expect(events.events).toContainEqual(new TransactionCanceled('transactionId'));
  });

  it('prevents to create a transaction with the payer as recipient', () => {
    const payer = createMember();

    expect(() => {
      createTransaction({ ...defaultTransaction, payer, recipient: payer, creator: payer });
    }).toThrow(new PayerIsRecipientError(payer.id));
  });

  it('prevents to create a transaction when creator is not payer or recipient', () => {
    const payer = createMember();
    const recipient = createMember();
    const creator = createMember();

    expect(() => {
      createTransaction({ ...defaultTransaction, payer, recipient, creator });
    }).toThrow(new InvalidTransactionCreatorError(creator.id, payer.id, recipient.id));
  });

  it('prevents to create a transaction with a negative amount', () => {
    const payer = createMember();
    const recipient = createMember();

    expect(() => {
      createTransaction({ ...defaultTransaction, payer, recipient, creator: payer, amount: -1 });
    }).toThrow(new NegativeAmountError(-1));
  });

  it('prevents to create a transaction with a null amount', () => {
    const payer = createMember();
    const recipient = createMember();

    expect(() => {
      createTransaction({ ...defaultTransaction, payer, recipient, creator: payer, amount: 0 });
    }).toThrow(new NegativeAmountError(0));
  });

  it('prevents to accept a transaction if not payer', () => {
    const transaction = createTransactionEntity({
      payerId: 'payerId',
      recipientId: 'recipientId',
      creatorId: 'recipientId',
    });

    expect(() => {
      checkCanAcceptTransaction({
        transaction,
        memberId: 'recipientId',
      });
    }).toThrow(new MemberIsNotPayerError('transactionId', 'recipientId', 'payerId'));
  });

  it('prevents to complete a transaction that is not pending', () => {
    const transaction = createTransactionEntity({
      status: TransactionStatus.completed,
    });

    expect(() => {
      completeTransaction({
        transaction,
        payer: createMember(),
        recipient: createMember(),
      });
    }).toThrow(new TransactionIsNotPendingError('transactionId', TransactionStatus.completed));
  });

  it('prevents to cancel a transaction if not payer', () => {
    const transaction = createTransactionEntity({
      payerId: 'payerId',
      recipientId: 'recipientId',
      creatorId: 'recipientId',
    });

    expect(() => {
      checkCanCancelTransaction({
        transaction,
        memberId: 'recipientId',
      });
    }).toThrow(new MemberIsNotPayerError('transactionId', 'recipientId', 'payerId'));
  });

  it('prevents to cancel a transaction that is not pending', () => {
    const transaction = createTransactionEntity({
      status: TransactionStatus.completed,
    });

    expect(() => {
      cancelTransaction({ transaction });
    }).toThrow(new TransactionIsNotPendingError('transactionId', TransactionStatus.completed));
  });
});
