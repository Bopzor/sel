import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { TokenRepository } from '../authentication/token.repository';
import { MembersRepository } from '../members/members.repository';
import { TOKENS } from '../tokens';

export class SessionController {
  static inject = injectableClass(this, TOKENS.membersRepository, TOKENS.tokenRepository);

  readonly router = Router();

  constructor(
    private readonly memberRepository: MembersRepository,
    private readonly tokenRepository: TokenRepository
  ) {
    this.router.get('/member', this.getCurrentMember);
  }

  getCurrentMember: RequestHandler = async (req, res) => {
    const tokenValue = req.cookies['token'];

    const token = await this.tokenRepository.findByValue(tokenValue);
    assert(token);

    const member = await this.memberRepository.getMember(token.memberId);
    assert(member);

    res.json(member);
  };
}
