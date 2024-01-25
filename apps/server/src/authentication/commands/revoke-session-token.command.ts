import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { AuthenticationService } from '../authentication.service';
import { TokenType } from '../token.entity';

export class RevokeSessionToken {
  static inject = injectableClass(this, TOKENS.authenticationService);

  constructor(private readonly authenticationService: AuthenticationService) {}

  async handle(tokenValue: string): Promise<void> {
    await this.authenticationService.revokeToken(tokenValue, TokenType.session);
  }
}
