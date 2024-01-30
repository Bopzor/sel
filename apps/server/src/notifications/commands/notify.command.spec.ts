import { NotificationData } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../../common/notification-delivery-type';
import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../../infrastructure/generator/stub-generator.adapter';
import { FormatJsTranslationAdapter } from '../../infrastructure/translation/formatjs-translation.adapter';
import { createMember } from '../../members/member.entity';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { InMemoryNotificationRepository } from '../../persistence/repositories/notification/in-memory-notification.repository';
import { InMemorySubscriptionRepository } from '../../persistence/repositories/subscription/in-memory.subscription.repository';
import { UnitTest } from '../../unit-test';
import { NotificationCreated } from '../notification-events';
import { createSubscription } from '../subscription.entity';

import { Notify, NotifyCommand } from './notify.command';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  translation = new FormatJsTranslationAdapter();
  eventPublisher = new StubEventPublisher();
  memberRepository = new InMemoryMemberRepository();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);

  handler = new Notify(
    this.generator,
    this.dateAdapter,
    this.translation,
    this.eventPublisher,
    this.memberRepository,
    this.subscriptionRepository,
    this.notificationRepository
  );

  command: NotifyCommand = {
    subscriptionType: 'NewAppVersion',
    notificationType: 'NewAppVersion',
    data: { version: '1.2.3' },
  };

  setup(): void {
    this.generator.nextId = 'notificationId';
  }

  async execute() {
    await this.handler.handle(this.command);
  }
}

describe('[Unit] Notify', () => {
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
      })
    );

    test.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId',
        memberId: 'memberId',
        type: 'NewAppVersion',
      })
    );

    await test.execute();

    const notification = test.notificationRepository.get('notificationId');

    expect(notification).toHaveProperty('id', 'notificationId');
    expect(notification).toHaveProperty('title', "Nouvelle version de l'app");
    expect(notification).toHaveProperty('content', "Une nouvelle version de l'app est disponible.");
    expect(notification).toHaveProperty('data', { version: '1.2.3' });
    expect(notification).toHaveProperty('deliveryType', notificationDelivery);

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

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveLength(0);
  });

  it('does not send a notification when the predicate does not pass', async () => {
    for (const i of [1, 2]) {
      test.memberRepository.add(createMember({ id: `memberId${i}` }));

      test.subscriptionRepository.add(
        createSubscription({ id: `subscriptionId${i}`, memberId: `memberId${i}`, type: 'RequestCreated' })
      );
    }

    test.command = {
      subscriptionType: 'RequestCreated',
      notificationType: 'RequestCreated',
      data: {
        request: {
          id: '',
          title: '',
          requester: { id: 'memberId2', firstName: '', lastName: '' },
          message: '',
        },
      } satisfies NotificationData['RequestCreated'],
    };

    await test.execute();

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
        entity: { type: 'request', id: 'requestId1' },
        memberId: 'memberId',
      })
    );

    test.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId2',
        type: 'RequestEvent',
        entity: { type: 'request', id: 'requestId2' },
        memberId: 'memberId',
      })
    );

    test.command = {
      subscriptionType: 'RequestEvent',
      notificationType: 'RequestCommentCreated',
      data: {
        request: { id: 'requestId1', title: '', requester: { id: '', firstName: '', lastName: '' } },
        comment: { id: '', author: { id: '', firstName: '', lastName: '' }, message: '' },
      } satisfies NotificationData['RequestCommentCreated'],
    };

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveLength(1);
    expect(notifications).toHaveProperty('0.subscriptionId', 'subscriptionId1');
  });
});
