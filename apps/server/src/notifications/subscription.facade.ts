import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { SubscriptionType } from './subscription.repository';
import { GetNotificationPayload, NotificationPayload, SubscriptionService } from './subscription.service';

export type { NotificationPayload };

export interface SubscriptionFacade {
  createSubscription(type: SubscriptionType, memberId: string): Promise<void>;
  notify(type: SubscriptionType, getPayload: GetNotificationPayload): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async createSubscription(type: SubscriptionType, memberId: string): Promise<void> {
    await this.subscriptionService.createSubscription(type, memberId);
  }

  async notify(type: SubscriptionType, getPayload: GetNotificationPayload): Promise<void> {
    await this.subscriptionService.notify(type, getPayload);
  }
}

export class StubSubscriptionFacade implements SubscriptionFacade {
  createSubscription(type: SubscriptionType, memberId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  notify(type: SubscriptionType, getPayload: GetNotificationPayload): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
