import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { InMemoryNotificationRepository } from '../../persistence/repositories/notification/in-memory-notification.repository';
import { UnitTest } from '../../unit-test';
import { MemberIsNotNotificationRecipient, NotificationNotFound } from '../notification-errors';
import { createNotification } from '../notification.entity';

import { MarkNotificationAsRead } from './mark-notification-as-read.command';

class Test extends UnitTest {
  dateAdapter = new StubDate();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);
  handler = new MarkNotificationAsRead(this.notificationRepository);

  now = createDate('2024-01-01');

  setup(): void {
    this.dateAdapter.date = this.now;
  }
}

describe('[Unit] MarkNotificationAsRead', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      test.notificationRepository.add(
        createNotification({ id: 'notificationId', memberId: 'memberId', readAt: undefined })
      );

      await test.handler.handle({ notificationId: 'notificationId', memberId: 'memberId' });

      expect(test.notificationRepository.get('notificationId')).toHaveProperty('readAt', test.now);
    });

    it('fails when the notification does not exist', async () => {
      await expect(
        test.handler.handle({ notificationId: 'notificationId', memberId: 'memberId' })
      ).rejects.toThrow(NotificationNotFound);
    });

    it('fails when the member is not the recipient of the notification', async () => {
      test.notificationRepository.add(
        createNotification({ id: 'notificationId', memberId: 'memberId', readAt: undefined })
      );

      await expect(
        test.handler.handle({ notificationId: 'notificationId', memberId: 'notMemberId' })
      ).rejects.toThrow(MemberIsNotNotificationRecipient);
    });
  });
});
