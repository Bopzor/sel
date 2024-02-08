import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface AuthenticationApi {
  requestAuthenticationLink(email: string): Promise<void>;
  verifyAuthenticationToken(token: string): Promise<void>;
}

export class FetchAuthenticationApi implements AuthenticationApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async requestAuthenticationLink(email: string): Promise<void> {
    const params = new URLSearchParams({ email });
    await this.fetcher.post(`/api/authentication/request-authentication-link?${params}`);
  }

  async verifyAuthenticationToken(token: string): Promise<void> {
    const params = new URLSearchParams({ token });
    await this.fetcher.get(`/api/authentication/verify-authentication-token?${params}`);
  }
}

export class StubAuthenticationApi implements AuthenticationApi {
  async requestAuthenticationLink(): Promise<void> {}
  async verifyAuthenticationToken(): Promise<void> {}
}
