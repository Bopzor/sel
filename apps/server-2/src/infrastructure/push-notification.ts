import { injectableClass } from 'ditox';
import { PushSubscription, sendNotification, setVapidDetails } from 'web-push';

import { TOKENS } from 'src/tokens';

import { Config } from './config';
import { DomainError } from './domain-error';

export type PushDeviceSubscription = string;
export type DeviceType = 'mobile' | 'desktop';

export interface PushNotification {
  init?(): void;
  send(subscription: PushDeviceSubscription, title: string, content: string, link: string): Promise<void>;
}

export class PushNotificationDeliveryError extends DomainError {
  constructor(
    public readonly subscription: PushDeviceSubscription,
    public readonly error: unknown,
  ) {
    super(error instanceof Error ? error.message : 'Unknown push notification error');
  }
}

export class WebPushNotification implements PushNotification {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: Config) {}

  init() {
    const { subject, publicKey, privateKey } = this.config.push;

    setVapidDetails(subject, publicKey, privateKey);
  }

  async send(
    subscription: PushDeviceSubscription,
    title: string,
    content: string,
    link: string,
  ): Promise<void> {
    try {
      await sendNotification(
        JSON.parse(subscription) as PushSubscription,
        JSON.stringify({ title, content, link }),
      );
    } catch (error) {
      throw new PushNotificationDeliveryError(subscription, error);
    }
  }
}
