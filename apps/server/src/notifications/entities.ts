import { createFactory, createId } from '@sel/utils';

import { SubscriptionEventType } from './subscription.repository';

export type Subscription = {
  id: string;
  eventType: SubscriptionEventType;
  memberId: string;
};

export const createSubscription = createFactory<Subscription>(() => ({
  id: createId(),
  eventType: 'NewAppVersion',
  memberId: '',
}));

export type Notification = {
  id: string;
};

export const createNotification = createFactory<Notification>(() => ({
  id: createId(),
}));
