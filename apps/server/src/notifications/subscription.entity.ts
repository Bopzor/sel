import { createFactory, createId } from '@sel/utils';

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
