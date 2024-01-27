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

  async getSubscriptions({ type, entity }: GetSubscriptionsFilters): Promise<Subscription[]> {
    return this.filter((subscription) => {
      if (type !== undefined && subscription.type !== type) {
        return false;
      }

      if (
        entity !== undefined &&
        (entity.type !== subscription.entity?.type || entity.id !== subscription.entity?.id)
      ) {
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
}
