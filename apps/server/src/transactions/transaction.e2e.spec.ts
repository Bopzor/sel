import * as shared from '@sel/shared';
import { CreateTransactionBody } from '@sel/shared/src/transaction';
import { pick } from '@sel/utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';
import { Member } from '../members/member.entity';
import { TOKENS } from '../tokens';

class Test extends E2ETest {
  payer!: Member;
  payerToken!: string;

  recipient!: Member;
  recipientToken!: string;

  async setup(): Promise<void> {
    [this.payer, this.payerToken] = await this.createAuthenticatedMember({
      email: 'payer',
      balance: 1,
    });

    [this.recipient, this.recipientToken] = await this.createAuthenticatedMember({
      email: 'recipient',
      balance: 1,
    });
  }

  async getTransaction(transactionId: string) {
    return this.fetch(`/transactions/${transactionId}`, { token: this.payerToken });
  }

  async refreshMembers() {
    const memberRepository = container.resolve(TOKENS.memberRepository);

    this.payer = await memberRepository.getMemberOrFail(this.payer.id);
    this.recipient = await memberRepository.getMemberOrFail(this.recipient.id);
  }
}

describe('[E2E] Transaction', () => {
  let test: Test;

  let token: string;
  let payerId: string;
  let recipientId: string;

  beforeAll(async () => {
    test = await E2ETest.create(Test);
  });

  afterAll(() => test?.teardown());

  beforeEach(async () => {
    await test.reset();
    token = test.payerToken;
    payerId = test.payer.id;
    recipientId = test.recipient.id;
  });

  afterEach(() => test?.waitForEventHandlers());

  it('sends credits as a payer', async () => {
    const { body: transactionId } = await test.fetch<string>('/transactions', {
      token: test.payerToken,
      method: 'POST',
      body: {
        payerId,
        recipientId,
        amount: 1,
        description: 'description',
      } satisfies CreateTransactionBody,
    });

    expect(await test.getTransaction(transactionId)).toHaveProperty<shared.Transaction>('body', {
      id: transactionId,
      status: shared.TransactionStatus.completed,
      amount: 1,
      description: 'description',
      payer: pick(test.payer, ['id', 'firstName', 'lastName']),
      recipient: pick(test.recipient, ['id', 'firstName', 'lastName']),
      date: expect.any(String),
    });

    await test.refreshMembers();

    expect(test.payer.balance).toEqual(0);
    expect(test.recipient.balance).toEqual(2);
  });

  it('requests for credits as a recipient', async () => {
    const { body: transactionId } = await test.fetch<string>('/transactions', {
      token: test.recipientToken,
      method: 'POST',
      body: {
        payerId,
        recipientId,
        amount: 1,
        description: 'description',
      } satisfies CreateTransactionBody,
    });

    expect(await test.getTransaction(transactionId)).toHaveProperty<shared.Transaction>('body', {
      id: transactionId,
      status: shared.TransactionStatus.pending,
      amount: 1,
      description: 'description',
      payer: pick(test.payer, ['id', 'firstName', 'lastName']),
      recipient: pick(test.recipient, ['id', 'firstName', 'lastName']),
      date: expect.any(String),
    });

    expect(
      await test.fetch(`/transactions/${transactionId}/accept`, {
        token: test.recipientToken,
        method: 'PUT',
        assertStatus: false,
      }),
    ).toHaveProperty('response.status', HttpStatus.forbidden);

    await test.fetch(`/transactions/${transactionId}/accept`, {
      token: test.payerToken,
      method: 'PUT',
    });

    expect(await test.fetch(`/transactions/${transactionId}`, { token })).toHaveProperty<shared.Transaction>(
      'body',
      expect.objectContaining({
        status: shared.TransactionStatus.completed,
      }),
    );

    await test.refreshMembers();

    expect(test.payer.balance).toEqual(0);
    expect(test.recipient.balance).toEqual(2);
  });

  it('cancels a transaction as a payer', async () => {
    await test.application.createTransaction({
      transactionId: 'transactionId',
      creatorId: recipientId,
      payerId,
      recipientId,
      amount: 1,
      description: '',
    });

    expect(
      await test.fetch(`/transactions/transactionId/cancel`, {
        token: test.recipientToken,
        method: 'PUT',
        assertStatus: false,
      }),
    ).toHaveProperty('response.status', HttpStatus.forbidden);

    await test.fetch(`/transactions/transactionId/cancel`, {
      token: test.payerToken,
      method: 'PUT',
    });

    expect(await test.fetch(`/transactions/transactionId`, { token })).toHaveProperty<shared.Transaction>(
      'body',
      expect.objectContaining({
        status: shared.TransactionStatus.canceled,
      }),
    );
  });
});
