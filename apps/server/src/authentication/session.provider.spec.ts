import { beforeEach, describe, expect, it } from 'vitest';

import { createMember } from '../members/member.entity';
import { InMemoryMemberRepository } from '../persistence/repositories/member/in-memory-member.repository';
import { InMemoryTokenRepository } from '../persistence/repositories/token/in-memory-token.repository';
import { UnitTest } from '../unit-test';

import { AuthenticationError, InvalidSessionTokenError } from './authentication.errors';
import { SessionProvider } from './session.provider';
import { TokenType, createToken } from './token.entity';

class Test extends UnitTest {
  tokenRepository = new InMemoryTokenRepository();
  memberRepository = new InMemoryMemberRepository();

  provider = new SessionProvider(this.tokenRepository, this.memberRepository);

  token = createToken({ memberId: 'memberId', value: 'token', type: TokenType.session });
  member = createMember({ id: 'memberId' });

  setup() {
    this.tokenRepository.add(this.token);
    this.memberRepository.add(this.member);
  }
}

describe('[Unit] SessionProvider', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('retrieves a provided member', async () => {
    expect.assertions(1);

    await test.provider.provide('token', () => {
      expect(test.provider.getMember()).toEqual(test.member);
    });
  });

  it('throws an AuthenticationError when no member is provided', () => {
    expect(() => test.provider.getMember()).toThrow(AuthenticationError);
  });

  it('throws an InvalidSessionTokenError when the session token is not valid', async () => {
    await expect(test.provider.provide('unknown-token', () => {})).rejects.toThrow(InvalidSessionTokenError);
  });

  it('throws an InvalidSessionTokenError when the token is an authentication token', async () => {
    test.tokenRepository.add(createToken({ value: 'auth-token', type: TokenType.authentication }));

    await expect(test.provider.provide('auth-token', () => {})).rejects.toThrow(InvalidSessionTokenError);
  });
});
