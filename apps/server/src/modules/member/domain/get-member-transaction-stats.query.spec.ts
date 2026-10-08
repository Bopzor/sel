import * as shared from '@sel/shared';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { getMemberTransactionStats } from './get-member-transaction-stats.query';

describe('getMemberTransactionStats', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  beforeEach(async () => {
    await persist.member({ id: 'memberId' });
    await persist.member({ id: 'matId' });
    await persist.member({ id: 'joshId' });
  });

  const transaction = (values: Parameters<typeof persist.transaction>[0]) => {
    return persist.transaction({
      payerId: 'memberId',
      recipientId: 'matId',
      creatorId: 'memberId',
      ...values,
    });
  };

  it("computes the stats of a member's completed transactions", async () => {
    await transaction({ amount: 2, payerId: 'memberId', recipientId: 'matId' });
    await transaction({ amount: 3, payerId: 'matId', recipientId: 'memberId' });
    await transaction({ amount: 5, payerId: 'joshId', recipientId: 'memberId' });
    await transaction({ amount: 7, status: shared.TransactionStatus.pending });
    await transaction({ amount: 11, status: shared.TransactionStatus.canceled });
    await transaction({ amount: 13, payerId: 'matId', recipientId: 'joshId' });

    expect(await getMemberTransactionStats('memberId')).toEqual<shared.MemberTransactionStats>({
      given: 2,
      received: 8,
      count: 3,
      partners: 2,
    });
  });

  it('computes the stats of a member without transactions', async () => {
    expect(await getMemberTransactionStats('memberId')).toEqual<shared.MemberTransactionStats>({
      given: 0,
      received: 0,
      count: 0,
      partners: 0,
    });
  });
});
