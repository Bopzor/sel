import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { SubscriptionType } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

export interface SubscriptionFacade {
  createSubscription(type: SubscriptionType, memberId: string): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async createSubscription(type: SubscriptionType, memberId: string) {
    return this.subscriptionService.createSubscription(type, memberId);
  }
}
