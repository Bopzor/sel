import { token } from 'ditox';

import { AnalyticsPort } from './infrastructure/analytics/analytics.port';
import { ConfigPort } from './infrastructure/config/config.port';
import { FetcherPort } from './infrastructure/fetcher';
import { GeocodePort } from './infrastructure/geocode/geocode.port';
import { MemberAvatarPort } from './infrastructure/member-avatar/member-avatar.port';
import { NotificationsPort } from './infrastructure/notifications/notifications.port';
import { RouterPort } from './infrastructure/router/router.port';
import { AuthenticationApi } from './modules/authentication/authentication.api';
import { MemberApi } from './modules/members/members.api';
import { RequestsApi } from './modules/requests/requests.api';
import { SessionApi } from './session.api';

export const TOKENS = {
  config: token<ConfigPort>('config'),
  analytics: token<AnalyticsPort>('analytics'),
  geocode: token<GeocodePort>('geocode'),
  fetcher: token<FetcherPort>('fetcher'),
  router: token<RouterPort>('router'),
  notifications: token<NotificationsPort>('notifications'),
  memberAvatar: token<MemberAvatarPort>('memberAvatar'),
  sessionApi: token<SessionApi>('sessionApi'),
  authenticationApi: token<AuthenticationApi>('authenticationApi'),
  requestApi: token<RequestsApi>('requestApi'),
  memberApi: token<MemberApi>('memberApi'),
};
