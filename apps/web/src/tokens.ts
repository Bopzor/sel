import { token } from 'ditox';

import { AnalyticsPort } from './infrastructure/analytics/analytics.port';
import { Api } from './infrastructure/api';
import { ConfigPort } from './infrastructure/config/config.port';
import { FetcherPort } from './infrastructure/fetcher';
import { GeocodePort } from './infrastructure/geocode/geocode.port';
import { MemberAvatarPort } from './infrastructure/member-avatar/member-avatar.port';
import { NotificationsPort } from './infrastructure/notifications/notifications.port';
import { RouterPort } from './infrastructure/router/router.port';
import { PushSubscriptionPort } from './infrastructure/subscription/push-subscription.port';
import { InterestApi } from './modules/interests/interests-api';
import { MemberApi } from './modules/members/members.api';
import { ProfileApi } from './modules/profile/profile.api';
import { TransactionsApi } from './transactions.api';

export const TOKENS = {
  config: token<ConfigPort>('config'),
  analytics: token<AnalyticsPort>('analytics'),
  geocode: token<GeocodePort>('geocode'),
  fetcher: token<FetcherPort>('fetcher'),
  router: token<RouterPort>('router'),
  notifications: token<NotificationsPort>('notifications'),
  pushSubscription: token<PushSubscriptionPort>('subscription'),
  memberAvatar: token<MemberAvatarPort>('memberAvatar'),
  profileApi: token<ProfileApi>('profileApi'),
  api: token<Api>('api'),
  interestApi: token<InterestApi>('interestApi'),
  memberApi: token<MemberApi>('memberApi'),
  transactionApi: token<TransactionsApi>('transactionApi'),
};
