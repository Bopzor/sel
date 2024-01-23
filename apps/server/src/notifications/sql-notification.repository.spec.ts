import { createDate } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { createMember } from '../members/entities';
import { notifications } from '../persistence/schema';
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

  async find(notificationId: string) {
    const [result] = await this.database.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId));

    return result;
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

  describe('getNotification', () => {
    it('finds a notification from its id', async () => {
      const member = await test.persist.member(createMember());
      const subscription = await test.persist.subscription(createSubscription({ memberId: member.id }));

      const notification = await test.persist.notification(
        createNotification({ subscriptionId: subscription.id })
      );

      const found = await test.repository.getNotification(notification.id);

      expect(found).toHaveProperty('id', notification.id);
      expect(found).toHaveProperty('memberId', member.id);
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
          type: 'NewAppVersion',
          date: createDate(),
          title: '',
          content: '',
          data: { version: '' },
        },
      ]);

      const inserted = await test.find('notificationId');

      expect(inserted).toBeDefined();
      expect(inserted).toHaveProperty('id', 'notificationId');
    });

    it('does not fail when the given array is empty', async () => {
      await test.repository.insertAll([]);
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      const member = await test.persist.member(createMember());
      const subscription = await test.persist.subscription(createSubscription({ memberId: member.id }));

      const notification = await test.persist.notification(
        createNotification({ subscriptionId: subscription.id, readAt: undefined })
      );

      await test.repository.markAsRead(notification.id);

      const updated = await test.find(notification.id);

      expect(updated).toHaveProperty('readAt', test.now);
    });
  });
});
