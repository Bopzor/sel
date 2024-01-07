import { Subscription } from './entities';

const subscriptionTypes = ['NewAppVersion', 'RequestCreated'] as const;
export type SubscriptionType = (typeof subscriptionTypes)[number];

export function isSubscriptionType(type: unknown): type is SubscriptionType {
  return subscriptionTypes.includes(type as SubscriptionType);
}

export type SubscriptionEntityType = 'request';

export type InsertSubscriptionModel = {
  id: string;
  type: SubscriptionType;
  memberId: string;
  entityType?: SubscriptionEntityType;
  entityId?: string;
};

export interface SubscriptionRepository {
  getSubscriptionsForEventType(type: SubscriptionType): Promise<Subscription[]>;
  insert(model: InsertSubscriptionModel): Promise<void>;
}
