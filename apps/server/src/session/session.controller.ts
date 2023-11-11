import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { AuthenticationFacade } from '../authentication/authentication.facade';
import { MembersFacade } from '../members/members.facade';
import { TOKENS } from '../tokens';

import { SessionProvider } from './session.provider';

export class SessionController {
  static inject = injectableClass(
    this,
    TOKENS.authenticationFacade,
    TOKENS.membersFacade,
    TOKENS.sessionProvider
  );

  readonly router = Router();

  constructor(
    private readonly authenticationFacade: AuthenticationFacade,
    private readonly membersFacade: MembersFacade,
    private readonly sessionProvider: SessionProvider
  ) {
    this.router.delete('/', this.deleteCurrentSession);
    this.router.get('/member', this.getCurrentMember);
  }

  deleteCurrentSession: RequestHandler = async (req, res) => {
    this.sessionProvider.getMember();

    await this.authenticationFacade.revokeSessionToken(req.cookies['token']);

    const setCookie = [`token=`, `Max-Age=0`, 'HttpOnly', 'Path=/', 'SameSite=Lax'];

    res.header('Set-Cookie', setCookie.join(';'));
    res.status(204);
    res.end();
  };

  getCurrentMember: RequestHandler<never, shared.AuthenticatedMember> = async (req, res) => {
    const memberId = this.sessionProvider.getMember().id;

    res.json(await this.membersFacade.query_getAuthenticatedMember(memberId));
  };
}
