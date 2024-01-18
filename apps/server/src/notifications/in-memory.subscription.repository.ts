import { hasProperty } from '@sel/utils';

import { InMemoryRepository } from '../in-memory.repository';

import { Subscription, SubscriptionType } from './entities';
import { InsertSubscriptionModel, SubscriptionRepository } from './subscription.repository';

export class InMemorySubscriptionRepository
  extends InMemoryRepository<Subscription>
  implements SubscriptionRepository
{
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
