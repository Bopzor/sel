import { injectableClass } from 'ditox';
import webpush from 'web-push';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { PushNotificationPort, PushDeviceSubscription } from './push-notification.port';

export class WebPushNotificationAdapter implements PushNotificationPort {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: ConfigPort) {}

  init() {
    const { subject, publicKey, privateKey } = this.config.push;

    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  async send(subscription: PushDeviceSubscription, title: string, content: string): Promise<void> {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({ title, content })
    );
  }
}
