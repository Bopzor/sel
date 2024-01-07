import { NotificationType, isNotificationType } from '@sel/shared';

import { Subscription } from './entities';

export type SubscriptionType = NotificationType;
export const isSubscriptionType = isNotificationType;

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