import { hasId } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { createMember } from '../members/member.entity';
import { InMemoryMemberRepository } from '../persistence/repositories/member/in-memory-member.repository';
import { InMemoryNotificationRepository } from '../persistence/repositories/notification/in-memory-notification.repository';
import { InMemorySubscriptionRepository } from '../persistence/repositories/subscription/in-memory.subscription.repository';
import { UnitTest } from '../unit-test';

import { NotificationCreated } from './notification-events';
import { createSubscription } from './subscription.entity';
import { SubscriptionService } from './subscription.service';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  memberRepository = new InMemoryMemberRepository();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);

  service = new SubscriptionService(
    this.generator,
    this.dateAdapter,
    this.eventPublisher,
    this.memberRepository,
    this.subscriptionRepository,
    this.notificationRepository
  );

  setup(): void {
    this.generator.nextId = 'notificationId';
  }
}

describe('[Unit] SubscriptionService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('notify', () => {
    it('sends a notification to members subscribed to an event', async () => {
      const notificationDeliveryType = {
        [NotificationDeliveryType.email]: false,
        [NotificationDeliveryType.push]: true,
      };

      test.memberRepository.add(
        createMember({
          id: 'memberId',
          notificationDeliveryType,
        })
      );

      test.subscriptionRepository.add(
        createSubscription({
          id: 'subscriptionId',
          memberId: 'memberId',
          type: 'NewAppVersion',
        })
      );

      await test.service.notify(
        'NewAppVersion',
        () => true,
        () => ({
          type: 'NewAppVersion',
          title: 'title',
          titleTrimmed: 'title',
          content: 'content',
          data: { version: '1.2.3' },
        })
      );

      const notification = test.notificationRepository.get('notificationId');

      expect(notification).toHaveProperty('id', 'notificationId');
      expect(notification).toHaveProperty('title', 'title');
      expect(notification).toHaveProperty('content', 'content');
      expect(notification).toHaveProperty('data', { version: '1.2.3' });
      expect(notification).toHaveProperty('deliveryType', notificationDeliveryType);

      expect(test.eventPublisher).toHaveEmitted(new NotificationCreated('notificationId'));
    });

    it('does not send a notification when the subscription is not active', async () => {
      test.memberRepository.add(createMember({ id: 'memberId' }));

      test.subscriptionRepository.add(
        createSubscription({
          id: 'subscriptionId',
          memberId: 'memberId',
          type: 'NewAppVersion',
          active: false,
        })
      );

      await test.service.notify(
        'NewAppVersion',
        () => true,
        () => ({
          type: 'NewAppVersion',
          title: '',
          titleTrimmed: '',
          content: '',
          data: { version: '' },
        })
      );

      const notifications = test.notificationRepository.all();

      expect(notifications).toHaveLength(0);
    });

    it('does not send a notification when the predicate does not pass', async () => {
      for (const i of [1, 2]) {
        test.memberRepository.add(createMember({ id: `memberId${i}` }));

        test.subscriptionRepository.add(
          createSubscription({ id: `subscriptionId${i}`, memberId: `memberId${i}`, type: 'NewAppVersion' })
        );
      }

      await test.service.notify('NewAppVersion', hasId('memberId1'), () => ({
        type: 'NewAppVersion',
        title: '',
        titleTrimmed: '',
        content: '',
        data: { version: '' },
      }));

      const notifications = test.notificationRepository.all();

      expect(notifications).toHaveLength(1);
      expect(notifications).toHaveProperty('0.subscriptionId', 'subscriptionId1');
    });
  });
});
