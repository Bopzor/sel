import { hasProperty } from '@sel/utils';

import { InMemoryRepository } from '../in-memory.repository';

import { Subscription } from './entities';
import { InsertSubscriptionModel, SubscriptionRepository } from './subscription.repository';

export class InMemorySubscriptionRepository
  extends InMemoryRepository<Subscription>
  implements SubscriptionRepository
{
  async getSubscriptionsForEventType(eventType: 'NewAppVersion'): Promise<Subscription[]> {
    return this.filter(hasProperty('eventType', eventType));
  }

  async insert(model: InsertSubscriptionModel): Promise<void> {
    this.add({
      ...model,
    });
  }
}
