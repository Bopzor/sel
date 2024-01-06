import { createDate } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { notifications } from '../infrastructure/persistence/schema';
import { createMember } from '../members/entities';
import { RepositoryTest } from '../repository-test';

import { createNotification, createSubscription } from './entities';
import { SqlNotificationRepository } from './sql-notification.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  repository = new SqlNotificationRepository(this.database, this.dateAdapter);

  get now() {
    return this.dateAdapter.now();
  }

  async setup() {
    this.dateAdapter.date = createDate('2024-01-01');

    await this.database.migrate();
    await this.database.reset();
  }
}

describe('[Intg] SqlNotificationRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = await Test.create(Test);
  });

  describe('getNotificationsForMember', () => {
    it('get all notifications of the given member', async () => {
      const member = await test.persist.member(createMember({ id: 'memberId' }));
      const subscription = await test.persist.subscription(createSubscription({ memberId: member.id }));
      await test.persist.notification(
        createNotification({ id: 'notificationId', subscriptionId: subscription.id })
      );

      const notifications = await test.repository.getNotificationsForMember(member.id);

      expect(notifications).toHaveLength(1);
      expect(notifications).toHaveProperty('0.id', 'notificationId');
    });
  });

  describe('insertAll', () => {
    it('creates a set of notifications', async () => {
      const member = await test.persist.member(createMember());
      const subscription = await test.persist.subscription(createSubscription({ memberId: member.id }));

      await test.repository.insertAll([
        {
          id: 'notificationId',
          subscriptionId: subscription.id,
          date: createDate(),
          title: "Nouvelle version de l'app",
          content: "Une nouvelle version de l'app est disponible.",
        },
      ]);

      const inserted = await test.database.db
        .select()
        .from(notifications)
        .where(eq(notifications.id, 'notificationId'));

      expect(inserted).toHaveLength(1);
      expect(inserted).toHaveProperty('0.id', 'notificationId');
    });

    it('does not fail when the given array is empty', async () => {
      await test.repository.insertAll([]);
    });
  });
});
