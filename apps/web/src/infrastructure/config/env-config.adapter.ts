import { injectableClass } from 'ditox';

import { ConfigPort } from './config.port';

export class EnvConfigAdapter implements ConfigPort {
  static inject = injectableClass(this);

  private env = {
    API_URL: import.meta.env.VITE_API_URL,
    ANALYTICS_URL: import.meta.env.VITE_ANALYTICS_URL,
    ANALYTICS_SITE_ID: import.meta.env.VITE_ANALYTICS_SITE_ID,
    GEOAPIFY_API_KEY: import.meta.env.VITE_GEOAPIFY_API_KEY,
    WEB_PUSH_PUBLIC_KEY: import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY,
  };

  get api() {
    return {
      url: this.get('API_URL'),
    };
  }

  get analytics() {
    return {
      url: this.get('ANALYTICS_URL'),
      siteId: this.get('ANALYTICS_SITE_ID', Number),
    };
  }

  get geoapify() {
    return {
      apiKey: this.get('GEOAPIFY_API_KEY'),
    };
  }

  get push() {
    return {
      publicKey: this.get('WEB_PUSH_PUBLIC_KEY'),
    };
  }

  private get(name: keyof typeof this.env): string;
  private get<T>(name: keyof typeof this.env, parse: (value: string) => T): T;

  private get<T>(name: keyof typeof this.env, parse?: (value: string) => T) {
    const value = this.env[name];

    if (value === undefined) {
      throw new Error(`Missing environment variable: ${name}`);
    }

    return parse ? parse(value) : value;
  }
}
