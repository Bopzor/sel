import { Subscription, SubscriptionType } from '../../../notifications/subscription.entity';

export type SubscriptionEntityType = 'request';

export type InsertSubscriptionModel = {
  id: string;
  type: SubscriptionType;
  active?: boolean;
  memberId: string;
  entityType?: SubscriptionEntityType;
  entityId?: string;
};

export interface SubscriptionRepository {
  getSubscription(subscriptionId: string): Promise<Subscription | undefined>;

  hasSubscription(
    type: string,
    memberId: string,
    entity?: { type: 'request'; id: string } | undefined
  ): Promise<boolean>;

  getSubscriptionsByType(type: SubscriptionType): Promise<Subscription[]>;

  insert(model: InsertSubscriptionModel): Promise<void>;
}
