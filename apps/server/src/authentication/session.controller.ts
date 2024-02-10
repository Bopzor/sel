import * as shared from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

import { SessionProvider } from './session.provider';

export class SessionController {
  static inject = injectableClass(this, TOKENS.sessionProvider, TOKENS.commandBus, TOKENS.queryBus);

  readonly router = Router();

  constructor(
    private readonly sessionProvider: SessionProvider,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.router.delete('/', this.deleteCurrentSession);
    this.router.get('/member', this.getCurrentMember);
  }

  deleteCurrentSession: RequestHandler = async (req, res) => {
    this.sessionProvider.getMember();

    const token: string = req.cookies['token'];

    await this.commandBus.executeCommand(COMMANDS.revokeSessionToken, {
      token,
    });

    const setCookie = [`token=`, `Max-Age=0`, 'HttpOnly', 'Path=/', 'SameSite=Lax'];

    res.header('Set-Cookie', setCookie.join(';'));
    res.status(HttpStatus.noContent).end();
  };

  getCurrentMember: RequestHandler<never, shared.AuthenticatedMember> = async (req, res) => {
    const member = this.sessionProvider.getMember();

    const result = await this.queryBus.executeQuery(QUERIES.getAuthenticatedMember, {
      memberId: member.id,
    });

    assert(result);

    res.json(result);
  };
}
