import { token } from 'ditox';

import { FetcherPort } from './fetcher';
import { AnalyticsPort } from './infrastructure/analytics/analytics.port';
import { ConfigPort } from './infrastructure/config/config.port';
import { GeocodePort } from './infrastructure/geocode/geocode.port';
import { MemberProfileGateway } from './members/member-profile.gateway';

export const TOKENS = {
  config: token<ConfigPort>('config'),
  analytics: token<AnalyticsPort>('analytics'),
  geocode: token<GeocodePort>('geocode'),
  fetcher: token<FetcherPort>('fetcher'),
  memberProfileGateway: token<MemberProfileGateway>('memberProfileGateway'),
};
