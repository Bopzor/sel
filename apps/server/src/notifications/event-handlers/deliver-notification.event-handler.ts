import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { PushNotificationPort } from '../../infrastructure/push-notification/push-notification.port';
import { MemberDeviceRepository } from '../../persistence/repositories/member-device/member-device.repository';
import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { SubscriptionRepository } from '../../persistence/repositories/subscription/subscription.repository';
import { TOKENS } from '../../tokens';
import { NotificationCreated } from '../notification-events';
import { Notification } from '../notification.entity';

export class DeliverNotification implements EventHandler<NotificationCreated> {
  static inject = injectableClass(
    this,
    TOKENS.memberDeviceRepository,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository,
    TOKENS.pushNotification
  );

  constructor(
    private readonly memberDeviceRepository: MemberDeviceRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly pushNotification: PushNotificationPort
  ) {}

  async handle(event: NotificationCreated): Promise<void> {
    const notification = await this.getNotification(event.entityId);

    if (notification.deliveryType.push) {
      await this.sendPushNotifications(notification);
    }
  }

  private async sendPushNotifications(notification: Notification) {
    const subscription = await this.getSubscription(notification.subscriptionId);

    const deviceSubscriptions = await this.memberDeviceRepository.getMemberDeviceSubscriptions(
      subscription.memberId
    );

    await Promise.all(
      deviceSubscriptions.map(async (subscription) => {
        await this.pushNotification.send(subscription, notification.titleTrimmed, notification.content);
      })
    );
  }

  private async getNotification(notificationId: string) {
    return defined(await this.notificationRepository.getNotification(notificationId));
  }

  private async getSubscription(subscriptionId: string) {
    return defined(await this.subscriptionRepository.getSubscription(subscriptionId));
  }
}
