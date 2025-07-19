import { useQuery } from '@tanstack/solid-query';

import { apiQuery } from './query';

export function getLetsConfig() {
  const config = useQuery(() => apiQuery('getConfig', {}));
  return () => config.data;
}

export function getAppConfig() {
  return {
    geoapifyApiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
    pushPublicKey: import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY,
    analyticsUrl: import.meta.env.VITE_ANALYTICS_URL,
    analyticsSiteId: import.meta.env.VITE_ANALYTICS_SITE_ID,
    contactLink: import.meta.env.VITE_CONTACT_LINK,
  };
}
