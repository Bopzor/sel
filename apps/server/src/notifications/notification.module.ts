import { injectableClass } from 'ditox';

import { PushNotificationPort } from '../infrastructure/push-notification/push-notification.port';
import { TOKENS } from '../tokens';

export class NotificationModule {
  static inject = injectableClass(this, TOKENS.pushNotification);

  constructor(private readonly pushNotification: PushNotificationPort) {}

  init() {
    this.pushNotification.init?.();
  }
}
