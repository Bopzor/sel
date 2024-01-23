import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { InMemoryNotificationRepository } from '../persistence/repositories/notification/in-memory-notification.repository';
import { UnitTest } from '../unit-test';

import { createNotification } from './entities';
import { MemberIsNotNotificationRecipient, NotificationNotFound } from './errors';
import { NotificationService } from './notification.service';

class Test extends UnitTest {
  dateAdapter = new StubDate();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);
  service = new NotificationService(this.notificationRepository);

  now = createDate('2024-01-01');

  setup(): void {
    this.dateAdapter.date = this.now;
  }
}

describe('NotificationService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      test.notificationRepository.add(
        createNotification({ id: 'notificationId', memberId: 'memberId', readAt: undefined })
      );

      await test.service.markAsRead('notificationId', 'memberId');

      expect(test.notificationRepository.get('notificationId')).toHaveProperty('readAt', test.now);
    });

    it('fails when the notification does not exist', async () => {
      await expect(test.service.markAsRead('notificationId', 'memberId')).rejects.toThrow(
        NotificationNotFound
      );
    });

    it('fails when the member is not the recipient of the notification', async () => {
      test.notificationRepository.add(
        createNotification({ id: 'notificationId', memberId: 'memberId', readAt: undefined })
      );

      await expect(test.service.markAsRead('notificationId', 'notMemberId')).rejects.toThrow(
        MemberIsNotNotificationRecipient
      );
    });
  });
});
