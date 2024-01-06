import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { SubscriptionEventType } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

export interface SubscriptionFacade {
  createSubscription(eventType: SubscriptionEventType, memberId: string): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async createSubscription(eventType: SubscriptionEventType, memberId: string) {
    return this.subscriptionService.createSubscription(eventType, memberId);
  }
}
