import { beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../../common/notification-delivery-type';
import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { Email, EmailKind } from '../../infrastructure/email/email.types';
import { StubEmailSenderAdapter } from '../../infrastructure/email/stub-email-sender.adapter';
import { StubPushNotificationAdapter } from '../../infrastructure/push-notification/stub-push-notification.adapter';
import { FormatJsTranslationAdapter } from '../../infrastructure/translation/formatjs-translation.adapter';
import { createMember } from '../../members/member.entity';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { InMemoryMemberDeviceRepository } from '../../persistence/repositories/member-device/in-memory-member-device.repository';
import { InMemoryNotificationRepository } from '../../persistence/repositories/notification/in-memory-notification.repository';
import { UnitTest } from '../../unit-test';
import { createMemberDevice } from '../member-device.entity';
import { NotificationCreated } from '../notification-events';
import { createNotification } from '../notification.entity';

import { DeliverNotification } from './deliver-notification.event-handler';

class Test extends UnitTest {
  dateAdapter = new StubDate();
  translation = new FormatJsTranslationAdapter();
  memberRepository = new InMemoryMemberRepository();
  memberDeviceRepository = new InMemoryMemberDeviceRepository();
  notificationRepository = new InMemoryNotificationRepository(this.dateAdapter);
  pushNotification = new StubPushNotificationAdapter();
  emailSender = new StubEmailSenderAdapter();

  handler = new DeliverNotification(
    this.translation,
    this.memberRepository,
    this.memberDeviceRepository,
    this.notificationRepository,
    this.pushNotification,
    this.emailSender
  );

  event = new NotificationCreated('notificationId');

  member = createMember({
    id: 'memberId',
    email: 'email',
    firstName: 'firstName',
  });

  memberDevice = createMemberDevice({
    memberId: 'memberId',
    subscription: Symbol(),
  });

  notification = createNotification({
    id: 'notificationId',
    memberId: 'memberId',
    title: 'title',
    titleTrimmed: 'title trimmed',
    content: 'content',
    deliveryType: {
      [NotificationDeliveryType.push]: false,
      [NotificationDeliveryType.email]: false,
    },
  });

  setup(): void {
    this.memberDeviceRepository.add(this.memberDevice);
    this.memberRepository.add(this.member);
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

  it('sends an email', async () => {
    test.notification.deliveryType[NotificationDeliveryType.email] = true;
    test.notificationRepository.add(test.notification);

    await test.execute();

    expect(test.emailSender.emails).toContainEqual<Email<EmailKind.notification>>({
      to: 'email',
      kind: EmailKind.notification,
      subject: "SEL'ons-nous - title",
      variables: {
        firstName: 'firstName',
        title: 'title',
        content: 'content',
      },
    });
  });

  it('does not send an email when not enabled', async () => {
    await test.execute();

    expect(test.emailSender.emails).toHaveLength(0);
  });
});
