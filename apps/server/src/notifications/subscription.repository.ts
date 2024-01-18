import { Subscription, SubscriptionType } from './entities';

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
  getSubscriptionsByType(type: SubscriptionType): Promise<Subscription[]>;
  insert(model: InsertSubscriptionModel): Promise<void>;
}
