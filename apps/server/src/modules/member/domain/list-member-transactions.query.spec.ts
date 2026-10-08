import * as shared from '@sel/shared';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { listMemberTransactions } from './list-member-transactions.query';

describe('listMemberTransactions', () => {
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

  const date = (day: number) => new Date(2025, 0, day);

  async function listTransactionIds(query: Partial<Parameters<typeof listMemberTransactions>[0]> = {}) {
    const { transactions } = await listMemberTransactions({ memberId: 'memberId', pageSize: 10, ...query });

    return transactions.map(({ id }) => id);
  }

  it('lists the pending transactions by creation date', async () => {
    await transaction({ id: 'olderId', status: shared.TransactionStatus.pending, createdAt: date(1) });
    await transaction({ id: 'newerId', status: shared.TransactionStatus.pending, createdAt: date(2) });
    await transaction({ completedAt: date(3) });

    expect(await listTransactionIds({ status: 'pending' })).toEqual(['newerId', 'olderId']);
  });

  it('lists the completed transactions by completion date', async () => {
    await transaction({ id: 'createdFirstId', createdAt: date(1), completedAt: date(4) });
    await transaction({ id: 'createdLastId', createdAt: date(2), completedAt: date(3) });
    await transaction({ status: shared.TransactionStatus.pending, createdAt: date(5) });

    expect(await listTransactionIds({ status: 'completed' })).toEqual(['createdFirstId', 'createdLastId']);
  });

  it('lists the pending transactions first, then the others by date', async () => {
    await transaction({ id: 'completedId', createdAt: date(1), completedAt: date(3) });
    await transaction({ id: 'pendingId', status: shared.TransactionStatus.pending, createdAt: date(2) });
    await transaction({ id: 'canceledId', status: shared.TransactionStatus.canceled, createdAt: date(4) });

    expect(await listTransactionIds()).toEqual(['pendingId', 'canceledId', 'completedId']);
  });

  it('lists the transactions with a counterpart', async () => {
    await transaction({ id: 'paidId', payerId: 'memberId', recipientId: 'matId' });
    await transaction({ id: 'receivedId', payerId: 'matId', recipientId: 'memberId' });
    await transaction({ payerId: 'memberId', recipientId: 'joshId' });
    await transaction({ payerId: 'matId', recipientId: 'joshId' });

    expect((await listTransactionIds({ counterpartId: 'matId' })).sort()).toEqual(['paidId', 'receivedId']);
  });

  it('paginates the transactions', async () => {
    await transaction({ id: 'firstId', completedAt: date(1) });
    await transaction({ id: 'secondId', completedAt: date(2) });
    await transaction({ id: 'thirdId', completedAt: date(3) });

    const { total, transactions } = await listMemberTransactions({
      memberId: 'memberId',
      page: 2,
      pageSize: 2,
    });

    expect(total).toBe(3);
    expect(transactions.map(({ id }) => id)).toEqual(['firstId']);
  });

  it('lists all the transactions without a page', async () => {
    for (let day = 1; day <= 3; day++) {
      await transaction({ completedAt: date(day) });
    }

    const { total, transactions } = await listMemberTransactions({ memberId: 'memberId', pageSize: 2 });

    expect(total).toBeUndefined();
    expect(transactions).toHaveLength(3);
  });
});
