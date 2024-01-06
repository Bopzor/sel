import { hasProperty } from '@sel/utils';

import { InMemoryRepository } from '../in-memory.repository';

import { Subscription } from './entities';
import { InsertSubscriptionModel, SubscriptionType, SubscriptionRepository } from './subscription.repository';

export class InMemorySubscriptionRepository
  extends InMemoryRepository<Subscription>
  implements SubscriptionRepository
{
  async getSubscriptionsForEventType(type: SubscriptionType): Promise<Subscription[]> {
    return this.filter(hasProperty('type', type));
  }

  async insert(model: InsertSubscriptionModel): Promise<void> {
    this.add({
      ...model,
    });
  }
}
