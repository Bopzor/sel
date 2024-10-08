import { AuthenticatedMember } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort, FetchError } from './infrastructure/fetcher';
import { TOKENS } from './tokens';

export interface SessionApi {
  getAuthenticatedMember(): Promise<AuthenticatedMember | undefined>;
  signOut(): Promise<void>;
}

export class FetchSessionApi implements SessionApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async getAuthenticatedMember(): Promise<AuthenticatedMember | undefined> {
    return await this.fetcher
      .get<AuthenticatedMember | undefined>('/session/member')
      .body()
      .catch((error) => {
        if (FetchError.is(error, 401)) {
          return undefined;
        }

        throw error;
      });
  }

  async signOut(): Promise<void> {
    await this.fetcher.delete('/session');
  }
}

export class StubSessionApi implements SessionApi {
  authenticatedMember: AuthenticatedMember | undefined;

  async getAuthenticatedMember(): Promise<AuthenticatedMember | undefined> {
    return this.authenticatedMember;
  }

  async signOut(): Promise<void> {
    this.authenticatedMember = undefined;
  }
}
