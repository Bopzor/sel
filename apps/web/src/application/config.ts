import { useQuery } from '@tanstack/solid-query';

import { apiQuery } from './query';

export function getLetsConfig() {
  const config = useQuery(() => apiQuery('getConfig', {}));
  return () => config.data;
}

declare global {
  var __ENV__: Record<string, string>;
}

export function getAppConfig() {
  return {
    version: __APP_VERSION__,
    environment: getEnv('VITE_ENVIRONMENT'),
    sentryDsn: getEnv('VITE_SENTRY_DSN'),
    geoapifyApiKey: getEnv('VITE_GEOAPIFY_API_KEY'),
    pushPublicKey: getEnv('VITE_WEB_PUSH_PUBLIC_KEY'),
    analyticsUrl: getEnv('VITE_ANALYTICS_URL'),
    analyticsSiteId: getEnv('VITE_ANALYTICS_SITE_ID'),
    contactEmail: getEnv('VITE_CONTACT_EMAIL'),
    contactPhone: getEnv('VITE_CONTACT_PHONE'),
  };
}

function getEnv(name: `VITE_${string}`) {
  return globalThis.__ENV__[name] ?? import.meta.env[name];
}
