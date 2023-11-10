import { Member } from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { AuthenticationFacade } from '../authentication/authentication.facade';
import { MembersFacade } from '../members/members.facade';
import { TOKENS } from '../tokens';

export class InvalidSessionTokenError extends Error {
  constructor() {
    super('invalid session token');
  }
}

export class SessionService {
  static inject = injectableClass(this, TOKENS.authenticationFacade, TOKENS.membersFacade);

  constructor(private authenticationFacade: AuthenticationFacade, private memberFacade: MembersFacade) {}

  async getSessionMember(token: string): Promise<Member> {
    const memberId = await this.authenticationFacade.getMemberIdFromSessionToken(token);

    if (!memberId) {
      throw new InvalidSessionTokenError();
    }

    const member = await this.memberFacade.getMemberFromId(memberId);

    assert(member, `cannot find memberId from token "${token}"`);

    return member;
  }
}
