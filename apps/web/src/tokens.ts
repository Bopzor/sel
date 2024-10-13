import { token } from 'ditox';

import { AnalyticsPort } from './infrastructure/analytics/analytics.port';
import { Api } from './infrastructure/api';
import { ConfigPort } from './infrastructure/config/config.port';
import { GeocodePort } from './infrastructure/geocode/geocode.port';
import { MemberAvatarPort } from './infrastructure/member-avatar/member-avatar.port';
import { NotificationsPort } from './infrastructure/notifications/notifications.port';
import { RouterPort } from './infrastructure/router/router.port';
import { PushSubscriptionPort } from './infrastructure/subscription/push-subscription.port';

export const TOKENS = {
  analytics: token<AnalyticsPort>('analytics'),
  api: token<Api>('api'),
  config: token<ConfigPort>('config'),
  fetch: token<typeof window.fetch>('fetch'),
  geocode: token<GeocodePort>('geocode'),
  memberAvatar: token<MemberAvatarPort>('memberAvatar'),
  notifications: token<NotificationsPort>('notifications'),
  pushSubscription: token<PushSubscriptionPort>('subscription'),
  router: token<RouterPort>('router'),
};
