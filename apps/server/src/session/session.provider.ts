import { AsyncLocalStorage } from 'node:async_hooks';

import { injectableClass } from 'ditox';

import { Member } from '../members/entities';

export class AuthenticationError extends Error {
  constructor() {
    super('request must me authenticated');
  }
}

export class SessionProvider {
  static inject = injectableClass(this);

  private storage = new AsyncLocalStorage<Member>();

  provide(member: Member, callback: () => void) {
    this.storage.run(member, callback);
  }

  getMember(): Member {
    const member = this.storage.getStore();

    if (!member) {
      throw new AuthenticationError();
    }

    return member;
  }
}
