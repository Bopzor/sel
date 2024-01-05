export type SubscriptionEventType = 'NewAppVersion';

export type SubscriptionEntityType = 'request';

export type InsertSubscriptionModel = {
  id: string;
  eventType: SubscriptionEventType;
  memberId: string;
  entityType?: SubscriptionEntityType;
  entityId?: string;
};

export interface SubscriptionRepository {
  insert(model: InsertSubscriptionModel): Promise<void>;
}
