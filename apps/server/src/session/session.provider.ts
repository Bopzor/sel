import { AsyncLocalStorage } from 'node:async_hooks';

import { AuthenticatedMember } from '@sel/shared';
import { injectableClass } from 'ditox';

export class AuthenticationError extends Error {
  constructor() {
    super('request must me authenticated');
  }
}

export class SessionProvider {
  static inject = injectableClass(this);

  private storage = new AsyncLocalStorage<AuthenticatedMember>();

  provide(member: AuthenticatedMember, callback: () => void) {
    this.storage.run(member, callback);
  }

  getMember(): AuthenticatedMember {
    const member = this.storage.getStore();

    if (!member) {
      throw new AuthenticationError();
    }

    return member;
  }
}
