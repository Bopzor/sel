import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../../common/notification-delivery-type';
import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubPushNotificationAdapter } from '../../infrastructure/push-notification/stub-push-notification.adapter';
import { InMemoryMemberDeviceRepository } from '../../persistence/repositories/member-device/in-memory-member-device.repository';
import { InMemoryNotificationRepository } from '../../persistence/repositories/notification/in-memory-notification.repository';
import { InMemorySubscriptionRepository } from '../../persistence/repositories/subscription/in-memory.subscription.repository';
import { UnitTest } from '../../unit-test';
import { createMemberDevice } from '../member-device.entity';
import { NotificationCreated } from '../notification-events';
import { createNotification } from '../notification.entity';
import { createSubscription } from '../subscription.entity';

import { DeliverNotification } from './deliver-notification.event-handler';

class Test extends UnitTest {
  dateAdapter = new StubDate();
  memberDeviceRepository = new InMemoryMemberDeviceRepository();
  subscriptionRepository = new InMemorySubscriptionRepository();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);
  pushNotification = new StubPushNotificationAdapter();

  handler = new DeliverNotification(
    this.memberDeviceRepository,
    this.subscriptionRepository,
    this.notificationRepository,
    this.pushNotification
  );

  event = new NotificationCreated('notificationId');

  memberDevice = createMemberDevice({
    memberId: 'memberId',
    subscription: Symbol(),
  });

  subscription = createSubscription({
    id: 'subscriptionId',
    memberId: 'memberId',
  });

  notification = createNotification({
    id: 'notificationId',
    subscriptionId: 'subscriptionId',
    titleTrimmed: 'title trimmed',
    content: 'content',
    deliveryType: {
      [NotificationDeliveryType.push]: false,
      [NotificationDeliveryType.email]: false,
    },
  });

  setup(): void {
    this.memberDeviceRepository.add(this.memberDevice);
    this.subscriptionRepository.add(this.subscription);
    this.notificationRepository.add(this.notification);
  }

  async execute() {
    await this.handler.handle(this.event);
  }
}

describe('[Unit] DeliverNotification', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('sends a push notification', async () => {
    test.notification.deliveryType[NotificationDeliveryType.push] = true;
    test.notificationRepository.add(test.notification);

    await test.execute();

    expect(test.pushNotification.notifications.get(test.memberDevice.subscription)).toEqual({
      title: 'title trimmed',
      content: 'content',
    });
  });

  it('does not send a push notification when not enabled', async () => {
    await test.execute();

    expect(test.pushNotification.notifications.get(test.memberDevice.subscription)).toBeUndefined();
  });
});
