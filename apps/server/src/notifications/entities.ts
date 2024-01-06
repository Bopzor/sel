import { createDate, createFactory, createId } from '@sel/utils';

import { SubscriptionType } from './subscription.repository';

export type Subscription = {
  id: string;
  type: SubscriptionType;
  memberId: string;
};

export const createSubscription = createFactory<Subscription>(() => ({
  id: createId(),
  type: 'NewAppVersion',
  memberId: '',
}));

export type Notification = {
  id: string;
  subscriptionId: string;
  content: string;
  title: string;
  date: Date;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
  subscriptionId: createId(),
  content: '',
  title: '',
  date: createDate(),
}));
