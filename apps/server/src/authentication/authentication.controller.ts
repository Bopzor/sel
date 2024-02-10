import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { ErrorRequestHandler, RequestHandler, Router } from 'express';
import { z } from 'zod';

import { HttpStatus } from '../http-status';
import { ConfigPort } from '../infrastructure/config/config.port';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

import { TokenExpired, TokenNotFound } from './authentication.errors';
import { TokenType } from './token.entity';

export class AuthenticationController {
  static inject = injectableClass(this, TOKENS.config, TOKENS.generator, TOKENS.commandBus, TOKENS.queryBus);

  readonly router = Router();

  constructor(
    private readonly config: ConfigPort,
    private readonly generator: GeneratorPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.router.post('/request-authentication-link', this.requestAuthenticationLink);

    this.router.get(
      '/verify-authentication-token',
      this.verifyAuthenticationToken,
      this.verifyAuthenticationTokenErrorHandler,
    );
  }

  requestAuthenticationLink: RequestHandler<{ email: string }> = async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
    });

    const { email } = schema.parse(req.query);

    await this.commandBus.executeCommand(COMMANDS.requestAuthenticationLink, {
      email,
    });

    res.end();
  };

  verifyAuthenticationToken: RequestHandler<{ token: string }> = async (req, res) => {
    const schema = z.object({
      token: z.string(),
    });

    const { token } = schema.parse(req.query);
    const sessionTokenId = this.generator.id();

    await this.commandBus.executeCommand(COMMANDS.verifyAuthenticationToken, {
      tokenValue: token,
      sessionTokenId,
    });

    const sessionToken = await this.queryBus.executeQuery(QUERIES.getToken, {
      tokenId: sessionTokenId,
      type: TokenType.session,
    });

    assert(sessionToken);

    const setCookie = [
      `token=${sessionToken.value}`,
      `Expires=${sessionToken.expirationDate.toUTCString()}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
    ];

    if (this.config.session.secure) {
      setCookie.push('Secure');
    }

    res.header('set-cookie', setCookie.join('; '));
    res.end();
  };

  verifyAuthenticationTokenErrorHandler: ErrorRequestHandler = async (err, req, res, next) => {
    if (err instanceof TokenNotFound || err instanceof TokenExpired) {
      res.status(HttpStatus.unauthorized).json({
        code: err.constructor.name,
        message: err.message,
        token: err.payload.tokenValue,
      });
    } else {
      next(err);
    }
  };
}
