import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailSenderPort } from '../../infrastructure/email/email-sender.port';
import { EmailKind } from '../../infrastructure/email/email.types';
import { PushNotificationPort } from '../../infrastructure/push-notification/push-notification.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { MemberDeviceRepository } from '../../persistence/repositories/member-device/member-device.repository';
import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { TOKENS } from '../../tokens';
import { NotificationCreated } from '../notification-events';
import { Notification } from '../notification.entity';

export class DeliverNotification implements EventHandler<NotificationCreated> {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.memberDeviceRepository,
    TOKENS.notificationRepository,
    TOKENS.pushNotification,
    TOKENS.emailSender
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly memberDeviceRepository: MemberDeviceRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly pushNotification: PushNotificationPort,
    private readonly emailSender: EmailSenderPort
  ) {}

  async handle(event: NotificationCreated): Promise<void> {
    const notification = await this.getNotification(event.entityId);

    if (notification.deliveryType.push) {
      await this.sendPushNotifications(notification);
    }

    if (notification.deliveryType.email) {
      await this.sendEmailNotification(notification);
    }
  }

  private async sendPushNotifications(notification: Notification) {
    const deviceSubscriptions = await this.getDeviceSubscriptions(notification);

    await Promise.all(
      deviceSubscriptions.map(async (subscription) => {
        await this.pushNotification.send(subscription, notification.titleTrimmed, notification.content);
      })
    );
  }

  private async sendEmailNotification(notification: Notification) {
    const member = await this.getMember(notification.memberId);

    await this.emailSender.send({
      to: member.email,
      kind: EmailKind.notification,
      subject: this.translation.translate('emailSubject', {
        prefix: this.translation.translate('emailSubjectPrefix'),
        subject: notification.title,
      }),
      variables: {
        firstName: member.firstName,
        title: notification.title,
        content: notification.content,
      },
    });
  }

  private async getNotification(notificationId: string) {
    return defined(await this.notificationRepository.getNotification(notificationId));
  }

  private async getDeviceSubscriptions(notification: Notification) {
    return this.memberDeviceRepository.getMemberDeviceSubscriptions(notification.memberId);
  }

  private async getMember(memberId: string) {
    return defined(await this.memberRepository.getMember(memberId));
  }
}
