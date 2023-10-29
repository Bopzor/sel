import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { TOKENS } from '../tokens';

import { AuthenticationService } from './authentication.service';

export class AuthenticationController {
  static inject = injectableClass(this, TOKENS.authenticationService);

  readonly router = Router();

  constructor(private readonly authenticationService: AuthenticationService) {
    this.router.get('/request-authentication-link', this.requestAuthenticationLink);
  }

  requestAuthenticationLink: RequestHandler<{ email: string }> = async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
    });

    const { email } = schema.parse(req.query);

    await this.authenticationService.requestAuthenticationLink(email);

    res.end();
  };
}
