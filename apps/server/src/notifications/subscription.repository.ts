import { Subscription } from './entities';

export type SubscriptionType = 'NewAppVersion' | 'RequestCreated';

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
