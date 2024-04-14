import { PushDeviceSubscription, PushNotificationPort } from './push-notification.port';

export class StubPushNotificationAdapter implements PushNotificationPort {
  notifications = new Map<PushDeviceSubscription, Array<{ title: string; content: string }>>();

  async send(subscription: PushDeviceSubscription, title: string, content: string): Promise<void> {
    if (!this.notifications.has(subscription)) {
      this.notifications.set(subscription, []);
    }

    this.notifications.get(subscription)?.push({ title, content });
  }
}
