import { createContainer } from 'ditox';

import { TOKENS } from '../tokens';

import { MatomoAnalyticsAdapter } from './analytics/matomo-analytics.adapter';
import { EnvConfigAdapter } from './config/env-config.adapter';

export const container = createContainer();

container.bindFactory(TOKENS.config, EnvConfigAdapter.inject);
container.bindFactory(TOKENS.analytics, MatomoAnalyticsAdapter.inject);
