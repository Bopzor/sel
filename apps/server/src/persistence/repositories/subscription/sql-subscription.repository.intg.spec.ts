import { createDate } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../../../infrastructure/date/stub-date.adapter';
import { createMember } from '../../../members/member.entity';
import { RepositoryTest } from '../../../repository-test';
import { subscriptions } from '../../schema';

import { SqlSubscriptionRepository } from './sql-subscription.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  repository = new SqlSubscriptionRepository(this.database, this.dateAdapter);

  get now() {
    return this.dateAdapter.now();
  }

  async setup() {
    this.dateAdapter.date = createDate('2024-01-01');

    await this.database.migrate();
    await this.database.reset();
  }
}

describe('[Intg] SqlSubscriptionRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = await Test.create(Test);
  });

  it('creates a new subscription', async () => {
    const member = await test.persist.member(createMember());

    await test.repository.insert({
      id: 'subscriptionId',
      type: 'NewAppVersion',
      memberId: member.id,
    });

    expect(
      await test.database.db.select().from(subscriptions).where(eq(subscriptions.id, 'subscriptionId'))
    ).toBeDefined();
  });
});
