import { createContainer } from 'ditox';

import { TOKENS } from '../tokens';

import { MatomoAnalyticsAdapter } from './analytics/matomo-analytics.adapter';
import { Api } from './api';
import { EnvConfigAdapter } from './config/env-config.adapter';
import { GeoapifyGeocodeAdapter } from './geocode/geocode-geoapify.adapter';
import { ToastNotificationsAdapter } from './notifications/toast-notifications.adapter';
import { SolidRouterAdapter } from './router/solid-router.adapter';
import { WebPushSubscriptionAdapter } from './subscription/web-push-subscription.adapter';

export const container = createContainer();

container.bindFactory(TOKENS.analytics, MatomoAnalyticsAdapter.inject);
container.bindFactory(TOKENS.api, Api.inject);
container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindValue(TOKENS.fetch, window.fetch.bind(window));
container.bindFactory(TOKENS.geocode, GeoapifyGeocodeAdapter.inject);
container.bindFactory(TOKENS.notifications, ToastNotificationsAdapter.inject);
container.bindFactory(TOKENS.pushSubscription, WebPushSubscriptionAdapter.inject);
container.bindFactory(TOKENS.router, SolidRouterAdapter.inject);
