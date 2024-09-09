import { ConfigPort } from './config.port';

export class StubConfigAdapter implements ConfigPort {
  constructor(private readonly overrides: Partial<ConfigPort> = {}) {}

  get api() {
    return {
      url: '',
    };
  }

  get analytics() {
    return {
      url: '',
      siteId: 0,
      ...this.overrides.analytics,
    };
  }

  get geoapify() {
    return {
      apiKey: '',
      ...this.overrides.geoapify,
    };
  }

  get push() {
    return {
      publicKey: '',
      ...this.overrides.push,
    };
  }
}
