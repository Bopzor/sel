import { injectableClass } from 'ditox';
import webpush from 'web-push';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { PushNotificationPort, PushDeviceSubscription } from './push-notification.port';

export class WebPushNotificationAdapter implements PushNotificationPort {
  static inject = injectableClass(this, TOKENS.config);

  constructor(config: ConfigPort) {
    webpush.setVapidDetails(config.push.subject, config.push.publicKey, config.push.privateKey);
  }

  async send(subscription: PushDeviceSubscription, title: string, content: string): Promise<void> {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({ title, content })
    );
  }
}
