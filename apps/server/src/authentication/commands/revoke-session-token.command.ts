import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { TOKENS } from '../../tokens';
import { AuthenticationService } from '../authentication.service';
import { TokenType } from '../token.entity';

export type RevokeSessionTokenCommand = {
  token: string;
};

export class RevokeSessionToken implements CommandHandler<RevokeSessionTokenCommand> {
  static inject = injectableClass(this, TOKENS.authenticationService);

  constructor(private readonly authenticationService: AuthenticationService) {}

  async handle({ token }: RevokeSessionTokenCommand): Promise<void> {
    await this.authenticationService.revokeToken(token, TokenType.session);
  }
}
