import { hasProperty } from '@sel/utils';

import { InMemoryRepository } from '../../../in-memory.repository';
import { Subscription, SubscriptionType } from '../../../notifications/subscription.entity';

import { InsertSubscriptionModel, SubscriptionRepository } from './subscription.repository';

export class InMemorySubscriptionRepository
  extends InMemoryRepository<Subscription>
  implements SubscriptionRepository
{
  async getSubscription(subscriptionId: string): Promise<Subscription | undefined> {
    return this.get(subscriptionId);
  }

  hasSubscription(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getSubscriptionsByType(type: SubscriptionType): Promise<Subscription[]> {
    return this.filter(hasProperty('type', type));
  }

  async insert(model: InsertSubscriptionModel): Promise<void> {
    this.add({
      active: true,
      ...model,
    });
  }
}
