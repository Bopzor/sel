import { isAfter } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { MemberAuthenticated } from '../../members/member-events';
import { TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { TokenExpired, TokenNotFound } from '../authentication.errors';
import { AuthenticationService } from '../authentication.service';
import { TokenType } from '../token.entity';

export type VerifyAuthenticationTokenCommand = {
  tokenValue: string;
  sessionTokenId: string;
};

export class VerifyAuthenticationToken implements CommandHandler<VerifyAuthenticationTokenCommand> {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.eventPublisher,
    TOKENS.tokenRepository,
    TOKENS.authenticationService
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly tokenRepository: TokenRepository,
    private readonly authenticationService: AuthenticationService
  ) {}

  async handle({ tokenValue, sessionTokenId }: VerifyAuthenticationTokenCommand): Promise<void> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (token === undefined) {
      throw new TokenNotFound(tokenValue);
    }

    if (isAfter(this.dateAdapter.now(), token.expirationDate)) {
      throw new TokenExpired(tokenValue);
    }

    this.eventPublisher.publish(new MemberAuthenticated(token.memberId));

    await this.tokenRepository.revoke(token.id);

    await this.authenticationService.generateToken(TokenType.session, sessionTokenId, token.memberId);
  }
}
