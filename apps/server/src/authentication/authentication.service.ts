import { Duration, addDuration } from '@sel/utils';
import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { EventPublisherPort } from '../infrastructure/events/event-publisher.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { MemberUnauthenticated } from '../members/events';
import { TokenRepository } from '../persistence/repositories/token/token.repository';
import { TOKENS } from '../tokens';

import { Token, TokenType } from './token.entity';

export class AuthenticationService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.eventPublisher,
    TOKENS.tokenRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly tokenRepository: TokenRepository
  ) {}

  private static expirationDurations: Record<TokenType, Duration> = {
    [TokenType.authentication]: { hours: 1 },
    [TokenType.session]: { months: 1 },
  };

  async generateToken(type: TokenType, tokenId: string, memberId: string): Promise<Token> {
    const expirationDate = addDuration(
      this.dateAdapter.now(),
      AuthenticationService.expirationDurations[type]
    );

    const token: Token = {
      id: tokenId,
      value: this.generator.token(24),
      expirationDate,
      type,
      memberId,
      revoked: false,
    };

    await this.tokenRepository.insert(token);

    return token;
  }

  async revokeToken(tokenValue: string, type?: TokenType): Promise<void> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (!token || (type && token.type !== type)) {
      return;
    }

    await this.tokenRepository.revoke(token.id);

    if (type === TokenType.session) {
      this.eventPublisher.publish(new MemberUnauthenticated(token.memberId));
    }
  }
}
