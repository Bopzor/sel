import * as shared from '@sel/shared';
import { CreateTransactionBody } from '@sel/shared/src/transaction';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';
import { Member } from '../members/member.entity';

class Test extends E2ETest {
  payer!: Member;
  payerToken!: string;

  recipient!: Member;
  recipientToken!: string;

  async setup(): Promise<void> {
    [this.payer, this.payerToken] = await this.createAuthenticatedMember({
      email: 'payer',
    });

    [this.recipient, this.recipientToken] = await this.createAuthenticatedMember({
      email: 'recipient',
    });
  }
}

describe('[E2E] Transaction', () => {
  let test: Test;
  let token: string;

  beforeAll(async () => {
    test = await E2ETest.create(Test);
  });

  afterAll(() => test?.teardown());

  beforeEach(async () => {
    await test.reset();
    token = test.payerToken;
  });

  afterEach(() => test?.waitForEventHandlers());

  it('creates a new transaction', async () => {
    const { body: transactionId } = await test.fetch('/transactions', {
      token,
      method: 'POST',
      body: {
        payerId: test.payer.id,
        recipientId: test.recipient.id,
        amount: 1,
        description: 'description',
      } satisfies CreateTransactionBody,
    });

    expect(await test.fetch(`/transactions/${transactionId}`, { token })).toHaveProperty<shared.Transaction>(
      'body',
      {
        id: transactionId as string,
        amount: 1,
        description: 'description',
        payerId: test.payer.id,
        recipientId: test.recipient.id,
        creatorId: test.payer.id,
      },
    );
  });
});
