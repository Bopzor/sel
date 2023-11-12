import { AuthenticatedMember } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetchResult, Fetcher } from '../fetcher';
import { TOKENS } from '../tokens';

import { AuthenticationGateway } from './authentication.gateway';

export class ApiAuthenticationGateway implements AuthenticationGateway {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: Fetcher) {}

  async getAuthenticatedMember(): Promise<AuthenticatedMember | undefined> {
    try {
      const { body } = await this.fetcher.get<AuthenticatedMember>(`/api/session/member`);

      return body;
    } catch (error) {
      if (FetchResult.is(error) && error.status === 401) {
        return;
      } else {
        throw error;
      }
    }
  }

  async requestAuthenticationLink(email: string): Promise<void> {
    await this.fetcher.post(
      `/api/authentication/request-authentication-link?${new URLSearchParams({ email })}`
    );
  }

  async verifyAuthenticationToken(token: string): Promise<void> {
    await this.fetcher.get(
      `/api/authentication/verify-authentication-token?${new URLSearchParams({ token })}`
    );
  }

  async signOut(): Promise<void> {
    await this.fetcher.delete(`/api/session`);
  }
}