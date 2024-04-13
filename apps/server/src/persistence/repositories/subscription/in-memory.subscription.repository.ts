import { InMemoryRepository } from '../../../in-memory.repository';
import { Subscription } from '../../../notifications/subscription.entity';

import {
  GetSubscriptionsFilters,
  InsertSubscriptionModel,
  SubscriptionRepository,
} from './subscription.repository';

export class InMemorySubscriptionRepository
  extends InMemoryRepository<Subscription>
  implements SubscriptionRepository
{
  hasSubscription(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getSubscriptions({ type, entityId, memberId }: GetSubscriptionsFilters): Promise<Subscription[]> {
    return this.filter((subscription) => {
      if (type !== undefined && subscription.type !== type) {
        return false;
      }

      if (entityId !== undefined && entityId !== subscription.entityId) {
        return false;
      }

      if (memberId && subscription.memberId !== memberId) {
        return false;
      }

      return true;
    });
  }

  async insert(model: InsertSubscriptionModel): Promise<void> {
    this.add({
      active: true,
      ...model,
    });
  }

  enable(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
