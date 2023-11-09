import { injectableClass } from 'ditox';

import { ConfigPort } from './config.port';

export class EnvConfigAdapter implements ConfigPort {
  static inject = injectableClass(this);

  private static env: Record<string, string | undefined> = {
    ANALYTICS_URL: parse(import.meta.env.VITE_ANALYTICS_URL),
    ANALYTICS_SITE_ID: parse(import.meta.env.VITE_ANALYTICS_SITE_ID),
    GEOAPIFY_API_KEY: parse(import.meta.env.VITE_GEOAPIFY_API_KEY),
  };

  get analytics() {
    return {
      url: String(EnvConfigAdapter.env.ANALYTICS_URL),
      siteId: Number(EnvConfigAdapter.env.ANALYTICS_SITE_ID),
    };
  }

  get geoapify() {
    return {
      apiKey: String(EnvConfigAdapter.env.GEOAPIFY_API_KEY),
    };
  }
}

function parse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
