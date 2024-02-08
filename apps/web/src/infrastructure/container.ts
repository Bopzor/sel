import { createContainer } from 'ditox';

import { Fetcher } from '../fetcher';
import { FetchMembersApi } from '../modules/members/members.api';
import { FetchRequestApi } from '../modules/requests/requests.api';
import { FetchSessionApi } from '../session.api';
import { TOKENS } from '../tokens';

import { MatomoAnalyticsAdapter } from './analytics/matomo-analytics.adapter';
import { EnvConfigAdapter } from './config/env-config.adapter';
import { GeoapifyGeocodeAdapter } from './geocode/geocode-geoapify.adapter';
import { ApiMemberAvatarAdapter } from './member-avatar/api-member-avatar.adapter';
import { ToastNotificationsAdapter } from './notifications/toast-notifications.adapter';
import { SolidRouterAdapter } from './router/solid-router.adapter';

export const container = createContainer();

container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.analytics, MatomoAnalyticsAdapter.inject);
container.bindFactory(TOKENS.geocode, GeoapifyGeocodeAdapter.inject);
container.bindFactory(TOKENS.router, SolidRouterAdapter.inject);
container.bindValue(TOKENS.fetcher, new Fetcher());
container.bindFactory(TOKENS.notifications, ToastNotificationsAdapter.inject);
container.bindFactory(TOKENS.memberAvatar, ApiMemberAvatarAdapter.inject);
container.bindFactory(TOKENS.sessionApi, FetchSessionApi.inject);
container.bindFactory(TOKENS.membersApi, FetchMembersApi.inject);
container.bindFactory(TOKENS.requestsApi, FetchRequestApi.inject);
