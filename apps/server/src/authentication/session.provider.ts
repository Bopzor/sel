import { AsyncLocalStorage } from 'node:async_hooks';

import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { Member } from '../members/member.entity';
import { MemberRepository } from '../persistence/repositories/member/member.repository';
import { TokenRepository } from '../persistence/repositories/token/token.repository';
import { TOKENS } from '../tokens';

import { AuthenticationError, InvalidSessionTokenError } from './authentication.errors';
import { TokenType } from './token.entity';

export class SessionProvider {
  static inject = injectableClass(this, TOKENS.tokenRepository, TOKENS.memberRepository);

  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly memberRepository: MemberRepository
  ) {}

  private storage = new AsyncLocalStorage<Member>();

  async provide(tokenValue: string, callback: () => void) {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (!token || token.type !== TokenType.session) {
      throw new InvalidSessionTokenError();
    }

    const member = await this.memberRepository.getMember(token.memberId);

    assert(member, `cannot find memberId from token "${token.value}"`);

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
