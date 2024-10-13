import { createContainer } from 'ditox';

import { FetchInterestApi } from '../modules/interests/interests-api';
import { FetchMemberApi } from '../modules/members/members.api';
import { TOKENS } from '../tokens';
import { FetchTransactionApi } from '../transactions.api';

import { MatomoAnalyticsAdapter } from './analytics/matomo-analytics.adapter';
import { Api } from './api';
import { EnvConfigAdapter } from './config/env-config.adapter';
import { Fetcher } from './fetcher';
import { GeoapifyGeocodeAdapter } from './geocode/geocode-geoapify.adapter';
import { ApiMemberAvatarAdapter } from './member-avatar/api-member-avatar.adapter';
import { ToastNotificationsAdapter } from './notifications/toast-notifications.adapter';
import { SolidRouterAdapter } from './router/solid-router.adapter';
import { WebPushSubscriptionAdapter } from './subscription/web-push-subscription.adapter';

export const container = createContainer();

container.bindFactory(TOKENS.analytics, MatomoAnalyticsAdapter.inject);
container.bindFactory(TOKENS.api, Api.inject);
container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.fetcher, Fetcher.inject);
container.bindFactory(TOKENS.geocode, GeoapifyGeocodeAdapter.inject);
container.bindFactory(TOKENS.interestApi, FetchInterestApi.inject);
container.bindFactory(TOKENS.memberApi, FetchMemberApi.inject);
container.bindFactory(TOKENS.memberAvatar, ApiMemberAvatarAdapter.inject);
container.bindFactory(TOKENS.notifications, ToastNotificationsAdapter.inject);
container.bindFactory(TOKENS.pushSubscription, WebPushSubscriptionAdapter.inject);
container.bindFactory(TOKENS.router, SolidRouterAdapter.inject);
container.bindFactory(TOKENS.transactionApi, FetchTransactionApi.inject);
