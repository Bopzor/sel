import { PushDeviceSubscription, PushNotificationPort } from './push-notification.port';

export class StubPushNotificationAdapter implements PushNotificationPort {
  notifications = new Map<PushDeviceSubscription, Array<{ title: string; content: string; link: string }>>();

  errors = new Map<PushDeviceSubscription, Error>();

  async send(
    subscription: PushDeviceSubscription,
    title: string,
    content: string,
    link: string,
  ): Promise<void> {
    if (this.errors.has(subscription)) {
      throw this.errors.get(subscription);
    }

    if (!this.notifications.has(subscription)) {
      this.notifications.set(subscription, []);
    }

    this.notifications.get(subscription)?.push({ title, content, link });
  }
}
