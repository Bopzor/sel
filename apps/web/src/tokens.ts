import { token } from 'ditox';

import { FetcherPort } from './fetcher';
import { AnalyticsPort } from './infrastructure/analytics/analytics.port';
import { ConfigPort } from './infrastructure/config/config.port';
import { GeocodePort } from './infrastructure/geocode/geocode.port';
import { NotificationsPort } from './infrastructure/notifications/notifications.port';

export const TOKENS = {
  config: token<ConfigPort>('config'),
  analytics: token<AnalyticsPort>('analytics'),
  geocode: token<GeocodePort>('geocode'),
  fetcher: token<FetcherPort>('fetcher'),
  notifications: token<NotificationsPort>('notifications'),
};
