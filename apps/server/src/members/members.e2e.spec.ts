import * as shared from '@sel/shared';
import { pick } from '@sel/utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';

class Test extends E2ETest {}

describe('[E2E] Members', () => {
  let test: Test;

  beforeAll(async () => {
    test = await E2ETest.create(E2ETest);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('rejects unauthenticated requests', async () => {
    const { response } = await test.fetch('/members', { assertStatus: false });
    expect(response.status).toEqual(HttpStatus.unauthorized);
  });

  it('returns the member transactions', async () => {
    const [member, token] = await test.createAuthenticatedMember({});
    const recipient = await test.create.member({ email: 'recipient' });

    await test.application.createTransaction({
      transactionId: 'transactionId',
      creatorId: member.id,
      payerId: member.id,
      recipientId: recipient.id,
      amount: 1,
      description: '',
    });

    const { body } = await test.fetch(`/members/${member.id}/transactions`, { token });

    expect(body).toEqual<shared.Transaction[]>([
      {
        id: 'transactionId',
        status: shared.TransactionStatus.completed,
        payer: pick(member, ['id', 'firstName', 'lastName']),
        recipient: pick(recipient, ['id', 'firstName', 'lastName']),
        amount: 1,
        description: '',
        date: expect.any(String),
      },
    ]);
  });
});
