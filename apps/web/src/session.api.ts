import { fakerFR as faker } from '@faker-js/faker';
import { AuthenticatedMember, createAuthenticatedMember } from '@sel/shared';
import { createId } from '@sel/utils';
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
      .get<AuthenticatedMember | undefined>('/api/session/member')
      .body()
      .catch((error) => {
        if (FetchError.is(error, 401)) {
          return undefined;
        }

        throw error;
      });
  }

  async signOut(): Promise<void> {
    await this.fetcher.delete('/api/session');
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

export class FakeSessionApi extends StubSessionApi {
  constructor() {
    super();

    this.authenticatedMember = createAuthenticatedMember({
      id: createId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    });
  }
}
