import { PushDeviceSubscription, PushNotificationPort } from './push-notification.port';

export class StubPushNotificationAdapter implements PushNotificationPort {
  notifications = new Map<PushDeviceSubscription, { title: string; content: string }>();

  async send(subscription: PushDeviceSubscription, title: string, content: string): Promise<void> {
    this.notifications.set(subscription, { title, content });
  }
}
