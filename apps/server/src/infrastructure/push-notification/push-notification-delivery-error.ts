import { WebPushError } from 'web-push';

import { DomainError } from '../../domain-error';

import { PushDeviceSubscription } from './push-notification.port';

export class PushNotificationDeliveryError extends DomainError<{
  subscription: PushDeviceSubscription;
  statusCode?: number;
  headers?: Record<string, string>;
  body?: string;
  endpoint?: string;
}> {
  constructor(subscription: PushDeviceSubscription, error: unknown) {
    const payload = {
      subscription,
      ...(error instanceof WebPushError ? error : {}),
    };

    super(error instanceof Error ? error.message : 'Unknown push notification error', payload);
  }
}
