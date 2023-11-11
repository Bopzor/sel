import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { MembersFacade } from '../members/members.facade';
import { TOKENS } from '../tokens';

import { SessionProvider } from './session.provider';

export class SessionController {
  static inject = injectableClass(this, TOKENS.membersFacade, TOKENS.sessionProvider);

  readonly router = Router();

  constructor(
    private readonly membersFacade: MembersFacade,
    private readonly sessionProvider: SessionProvider
  ) {
    this.router.get('/member', this.getCurrentMember);
  }

  getCurrentMember: RequestHandler<never, shared.AuthenticatedMember> = async (req, res) => {
    const memberId = this.sessionProvider.getMember().id;

    res.json(await this.membersFacade.query_getAuthenticatedMember(memberId));
  };
}
