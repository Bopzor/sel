import * as shared from '@sel/shared';
import { createDate, createFactory, createId } from '@sel/utils';

const subscriptionType = ['NewAppVersion', 'RequestCreated', 'RequestEvent'] as const;
export type SubscriptionType = (typeof subscriptionType)[number];

export const isSubscriptionType = (type: string): type is SubscriptionType => {
  return subscriptionType.includes(type as SubscriptionType);
};

export type Subscription = {
  id: string;
  type: SubscriptionType;
  active: boolean;
  memberId: string;
};

export const createSubscription = createFactory<Subscription>(() => ({
  id: createId(),
  type: 'NewAppVersion',
  active: true,
  memberId: '',
}));

export type Notification = {
  id: string;
  subscriptionId: string;
  memberId: string;
  type: shared.NotificationType;
  date: Date;
  readAt?: Date;
  content: string;
  title: string;
  data: unknown;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
  subscriptionId: '',
  type: 'NewAppVersion',
  memberId: '',
  content: '',
  title: '',
  date: createDate(),
  data: {},
}));
