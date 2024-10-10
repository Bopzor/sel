import { injectableClass } from 'ditox';
import { PushSubscription, sendNotification, setVapidDetails } from 'web-push';

import { TOKENS } from 'src/tokens';

import { Config } from './config';
import { DomainError } from './domain-error';
import { Logger } from './logger';

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
  static inject = injectableClass(this, TOKENS.config, TOKENS.logger);

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  init() {
    const { subject, publicKey, privateKey } = this.config.push;

    this.logger.log('Initializing push notification service');
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

export class StubPushNotification implements PushNotification {
  notifications = new Map<PushDeviceSubscription, Array<{ title: string; content: string; link: string }>>();
  errors = new Map<PushDeviceSubscription, Error>();

  async send(
    subscription: PushDeviceSubscription,
    title: string,
    content: string,
    link: string,
  ): Promise<void> {
    if (this.errors.has(subscription)) {
      throw this.errors.get(subscription)!;
    }

    if (!this.notifications.has(subscription)) {
      this.notifications.set(subscription, []);
    }

    this.notifications.get(subscription)?.push({ title, content, link });
  }
}
