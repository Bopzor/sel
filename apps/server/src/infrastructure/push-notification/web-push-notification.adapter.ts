import { injectableClass } from 'ditox';
import webpush from 'web-push';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { PushNotificationDeliveryError } from './push-notification-delivery-error';
import { PushDeviceSubscription, PushNotificationPort } from './push-notification.port';

// cspell:word webpush

export class WebPushNotificationAdapter implements PushNotificationPort {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: ConfigPort) {}

  init() {
    const { subject, publicKey, privateKey } = this.config.push;

    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  async send(
    subscription: PushDeviceSubscription,
    title: string,
    content: string,
    link: string,
  ): Promise<void> {
    try {
      await webpush.sendNotification(
        JSON.parse(subscription) as webpush.PushSubscription,
        JSON.stringify({ title, content, link }),
      );
    } catch (error) {
      throw new PushNotificationDeliveryError(subscription, error);
    }
  }
}
