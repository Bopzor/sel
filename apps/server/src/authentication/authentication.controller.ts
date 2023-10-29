import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { ConfigPort } from '../infrastructure/config/config.port';
import { TOKENS } from '../tokens';

import { AuthenticationService } from './authentication.service';

export class AuthenticationController {
  static inject = injectableClass(this, TOKENS.config, TOKENS.authenticationService);

  readonly router = Router();

  constructor(
    private readonly config: ConfigPort,
    private readonly authenticationService: AuthenticationService
  ) {
    this.router.get('/request-authentication-link', this.requestAuthenticationLink);
    this.router.get('/verify-authentication-token', this.verifyAuthenticationToken);
  }

  requestAuthenticationLink: RequestHandler<{ email: string }> = async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
    });

    const { email } = schema.parse(req.query);

    await this.authenticationService.requestAuthenticationLink(email);

    res.end();
  };

  verifyAuthenticationToken: RequestHandler<{ token: string }> = async (req, res) => {
    const schema = z.object({
      token: z.string(),
    });

    const { token } = schema.parse(req.query);

    const sessionToken = await this.authenticationService.verifyAuthenticationToken(token);

    const setCookie = [
      `token=${sessionToken.value}`,
      `Expires=${sessionToken.expirationDate.toUTCString()}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
    ];

    if (this.config.server.sessionSecure) {
      setCookie.push('Secure');
    }

    res.header('set-cookie', setCookie.join('; '));
    res.end();
  };
}
