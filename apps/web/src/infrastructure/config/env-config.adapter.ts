import { injectableClass } from 'ditox';

import { ConfigPort } from './config.port';

export class EnvConfigAdapter implements ConfigPort {
  static inject = injectableClass(this);

  private env = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_ANALYTICS_URL: import.meta.env.VITE_ANALYTICS_URL,
    VITE_ANALYTICS_SITE_ID: import.meta.env.VITE_ANALYTICS_SITE_ID,
    VITE_GEOAPIFY_API_KEY: import.meta.env.VITE_GEOAPIFY_API_KEY,
    VITE_WEB_PUSH_PUBLIC_KEY: import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY,
  };

  get api() {
    return {
      url: this.get('VITE_API_URL'),
    };
  }

  get analytics() {
    return {
      url: this.get('VITE_ANALYTICS_URL'),
      siteId: this.get('VITE_ANALYTICS_SITE_ID', Number),
    };
  }

  get geoapify() {
    return {
      apiKey: this.get('VITE_GEOAPIFY_API_KEY'),
    };
  }

  get push() {
    return {
      publicKey: this.get('VITE_WEB_PUSH_PUBLIC_KEY'),
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
