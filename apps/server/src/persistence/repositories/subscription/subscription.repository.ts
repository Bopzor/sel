import { SubscriptionEntity, SubscriptionEntityType } from '../../../notifications/subscription.entity';
import { Subscription, SubscriptionType } from '../../../notifications/subscription.entity';

export type InsertSubscriptionModel = {
  id: string;
  type: SubscriptionType;
  active?: boolean;
  memberId: string;
  entityType?: SubscriptionEntityType;
  entityId?: string;
};

export type GetSubscriptionsFilters = {
  type?: SubscriptionType;
  entity?: SubscriptionEntity;
};

export interface SubscriptionRepository {
  hasSubscription(type: string, memberId: string, entity?: SubscriptionEntity): Promise<boolean>;

  getSubscriptions(filters: GetSubscriptionsFilters): Promise<Subscription[]>;

  insert(model: InsertSubscriptionModel): Promise<void>;
}
