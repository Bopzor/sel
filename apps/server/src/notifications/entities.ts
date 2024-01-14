import { createDate, createFactory, createId } from '@sel/utils';

import { SubscriptionType } from './subscription.repository';

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
  date: Date;
  content: string;
  title: string;
  data: unknown;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
  subscriptionId: createId(),
  content: '',
  title: '',
  date: createDate(),
  data: {},
}));
