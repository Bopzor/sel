import { EventBus } from '@sel/cqs';
import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { createMember } from '../members/member.entity';
import { InMemoryMemberRepository } from '../persistence/repositories/member/in-memory-member.repository';
import { InMemoryNotificationRepository } from '../persistence/repositories/notification/in-memory-notification.repository';
import { InMemorySubscriptionRepository } from '../persistence/repositories/subscription/in-memory.subscription.repository';
import { UnitTest } from '../unit-test';

import { NotificationCreated } from './notification-events';
import { createSubscription } from './subscription.entity';
import { NotificationCreator, SubscriptionService } from './subscription.service';

class Test extends UnitTest {
  now = createDate();

  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventBus = new EventBus();
  memberRepository = new InMemoryMemberRepository();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);

  subscriptionService = new SubscriptionService(
    this.generator,
    this.dateAdapter,
    this.eventBus,
    this.memberRepository,
    this.subscriptionRepository,
    this.notificationRepository,
  );

  setup(): void {
    this.generator.nextId = 'notificationId';
    this.dateAdapter.date = this.now;
  }

  async notify(overrides?: Partial<NotificationCreator>): Promise<void> {
    await this.subscriptionService.notify({
      subscriptionType: 'NewAppVersion',
      notificationType: 'NewAppVersion',
      data: () => ({
        shouldSend: true,
        title: 'title',
        push: {
          title: 'title',
          content: 'content',
        },
        email: {
          subject: 'subject',
          html: 'html',
          text: 'text',
        },
      }),
      ...overrides,
    });
  }
}

describe('[Unit] SubscriptionService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('sends a notification to members subscribed to an event', async () => {
    const notificationDelivery = {
      [NotificationDeliveryType.email]: false,
      [NotificationDeliveryType.push]: true,
    };

    test.memberRepository.add(
      createMember({
        id: 'memberId',
        notificationDelivery,
      }),
    );

    test.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId',
        memberId: 'memberId',
        type: 'NewAppVersion',
      }),
    );

    await test.notify();

    const notification = test.notificationRepository.get('notificationId');

    expect(notification).toHaveProperty('id', 'notificationId');
    expect(notification).toHaveProperty('title', 'title');
    expect(notification).toHaveProperty('deliveryType', notificationDelivery);
    expect(notification).toHaveProperty('push.title', 'title');
    expect(notification).toHaveProperty('push.content', 'content');
    expect(notification).toHaveProperty('email.subject', 'subject');
    expect(notification).toHaveProperty('email.html', 'html');
    expect(notification).toHaveProperty('email.text', 'text');
  });

  it('does not send a notification when the subscription is not active', async () => {
    test.memberRepository.add(createMember({ id: 'memberId' }));

    test.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId',
        memberId: 'memberId',
        type: 'NewAppVersion',
        active: false,
      }),
    );

    await test.notify();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveLength(0);
  });

  it('does not send a notification when the predicate does not pass', async () => {
    for (const i of [1, 2]) {
      test.memberRepository.add(createMember({ id: `memberId${i}` }));

      test.subscriptionRepository.add(
        createSubscription({
          id: `subscriptionId${i}`,
          memberId: `memberId${i}`,
          type: 'NewAppVersion',
          active: true,
        }),
      );
    }

    await test.notify({
      data: (member) => ({
        shouldSend: member.id === 'memberId1',
        title: '',
        push: { title: '', content: '' },
        email: { subject: '', html: '', text: '' },
      }),
    });

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveLength(1);
    expect(notifications).toHaveProperty('0.subscriptionId', 'subscriptionId1');
  });

  it('sends a notification related to specific entity only', async () => {
    test.memberRepository.add(createMember({ id: 'memberId' }));

    test.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId1',
        type: 'RequestEvent',
        entityId: 'requestId1',
        memberId: 'memberId',
      }),
    );

    test.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId2',
        type: 'RequestEvent',
        entityId: 'requestId2',
        memberId: 'memberId',
      }),
    );

    await test.notify({
      subscriptionType: 'RequestEvent',
      subscriptionEntityId: 'requestId1',
      notificationType: 'RequestCommentCreated',
      notificationEntityId: 'requestId1',
    });

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveLength(1);
    expect(notifications).toHaveProperty('0.subscriptionId', 'subscriptionId1');
  });
});
