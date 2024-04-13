import { Subscription, SubscriptionType } from '../../../notifications/subscription.entity';

export type InsertSubscriptionModel = {
  id: string;
  type: SubscriptionType;
  active?: boolean;
  memberId: string;
  entityId?: string;
};

export type GetSubscriptionsFilters = {
  type?: SubscriptionType;
  entityId?: string;
  memberId?: string;
};

export interface SubscriptionRepository {
  hasSubscription(type: string, memberId: string, entityId?: string): Promise<boolean>;

  getSubscriptions(filters: GetSubscriptionsFilters): Promise<Subscription[]>;

  insert(model: InsertSubscriptionModel): Promise<void>;

  enable(subscriptionIds: string[]): Promise<void>;
}
