import { beforeEach, describe, expect, it } from 'vitest';

import { StubAuthenticationFacade } from '../authentication/authentication.facade';
import { createMember } from '../members/entities';
import { StubMembersFacade } from '../members/members.facade';
import { UnitTest } from '../unit-test';

import { InvalidSessionTokenError, SessionService } from './session.service';

class Test extends UnitTest {
  authenticationFacade = new StubAuthenticationFacade();
  memberFacade = new StubMembersFacade();
  service = new SessionService(this.authenticationFacade, this.memberFacade);

  member = createMember({ id: 'memberId' });

  setup() {
    this.authenticationFacade.sessionTokenMembers.set('token', this.member);
    this.memberFacade.members.push(this.member);
  }
}

describe('[Unit] SessionService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('resolves with the member associated with a session token', async () => {
    await expect(test.service.getSessionMember('token')).resolves.toEqual(test.member);
  });

  it('throws an InvalidSessionTokenError when the session token is not valid', async () => {
    await expect(test.service.getSessionMember('unknown-token')).rejects.toThrow(InvalidSessionTokenError);
  });
});
