import { injectableClass } from 'ditox';

import { Member } from '../members/entities';
import { TOKENS } from '../tokens';

import { AuthenticationService } from './authentication.service';
import { TokenType } from './token.entity';

export interface AuthenticationFacade {
  getMemberIdFromSessionToken(tokenValue: string): Promise<string | undefined>;
}

export class AuthenticationFacadeImpl implements AuthenticationFacade {
  static inject = injectableClass(this, TOKENS.authenticationService);

  constructor(private readonly authenticationService: AuthenticationService) {}

  async getMemberIdFromSessionToken(token: string): Promise<string | undefined> {
    return this.authenticationService.getMemberIdFromToken(token, TokenType.session);
  }
}

export class StubAuthenticationFacade implements AuthenticationFacade {
  sessionTokenMembers = new Map<string, Member>();

  async getMemberIdFromSessionToken(tokenValue: string): Promise<string | undefined> {
    return this.sessionTokenMembers.get(tokenValue)?.id;
  }
}
