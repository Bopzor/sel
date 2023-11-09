import { ConfigPort } from './config.port';

export class StubConfigAdapter implements ConfigPort {
  constructor(private readonly overrides: Partial<ConfigPort> = {}) {}

  get analytics() {
    return {
      url: '',
      siteId: 0,
      ...this.overrides,
    };
  }

  get geoapify() {
    return {
      apiKey: '',
      ...this.overrides,
    };
  }
}
