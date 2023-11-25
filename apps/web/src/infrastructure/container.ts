import { createContainer } from 'ditox';

import { Fetcher } from '../fetcher';
import { TOKENS } from '../tokens';

import { MatomoAnalyticsAdapter } from './analytics/matomo-analytics.adapter';
import { EnvConfigAdapter } from './config/env-config.adapter';
import { GeoapifyGeocodeAdapter } from './geocode/geocode-geoapify.adapter';

export const container = createContainer();

container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.analytics, MatomoAnalyticsAdapter.inject);
container.bindFactory(TOKENS.geocode, GeoapifyGeocodeAdapter.inject);
container.bindValue(TOKENS.fetcher, new Fetcher());
