import { isAfter } from '@sel/utils';
import { injectableClass } from 'ditox';

import { DatePort } from '../../infrastructure/date/date.port';
import { EventsPort } from '../../infrastructure/events/events.port';
import { MemberAuthenticated } from '../../members/events';
import { TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { TokenExpired, TokenNotFound } from '../authentication.errors';
import { AuthenticationService } from '../authentication.service';
import { TokenType } from '../token.entity';

export class VerifyAuthenticationToken {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.events,
    TOKENS.tokenRepository,
    TOKENS.authenticationService
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly tokenRepository: TokenRepository,
    private readonly authenticationService: AuthenticationService
  ) {}

  async handle(tokenValue: string, sessionTokenId: string): Promise<void> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (token === undefined) {
      throw new TokenNotFound(tokenValue);
    }

    if (isAfter(this.dateAdapter.now(), token.expirationDate)) {
      throw new TokenExpired(tokenValue);
    }

    this.events.emit(new MemberAuthenticated(token.memberId));

    await this.tokenRepository.revoke(token.id);

    await this.authenticationService.generateToken(TokenType.session, sessionTokenId, token.memberId);
  }
}
