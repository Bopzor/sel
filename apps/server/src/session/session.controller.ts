import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { TOKENS } from '../tokens';

import { SessionProvider } from './session.provider';

export class SessionController {
  static inject = injectableClass(this, TOKENS.sessionProvider);

  readonly router = Router();

  constructor(private readonly authenticatedMemberProvider: SessionProvider) {
    this.router.get('/member', this.getCurrentMember);
  }

  getCurrentMember: RequestHandler = (req, res) => {
    res.json(this.authenticatedMemberProvider.getMember());
  };
}
