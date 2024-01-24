import { Duration, addDuration, isAfter } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../infrastructure/config/config.port';
import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { AuthenticationLinkRequested, MemberAuthenticated, MemberUnauthenticated } from '../members/events';
import { MembersFacade } from '../members/members.facade';
import { TokenRepository } from '../persistence/repositories/token/token.repository';
import { TOKENS } from '../tokens';

import { TokenExpired, TokenNotFound } from './authentication.errors';
import { Token, TokenType } from './token.entity';

export class AuthenticationService {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.events,
    TOKENS.tokenRepository,
    TOKENS.membersFacade
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly tokenRepository: TokenRepository,
    private readonly memberFacade: MembersFacade
  ) {}

  private static expirationDurations: Record<TokenType, Duration> = {
    [TokenType.authentication]: { hours: 1 },
    [TokenType.session]: { months: 1 },
  };

  async generateToken(type: TokenType, memberId: string): Promise<Token> {
    const expirationDate = addDuration(
      this.dateAdapter.now(),
      AuthenticationService.expirationDurations[type]
    );

    const token: Token = {
      id: this.generator.id(),
      value: this.generator.token(24),
      expirationDate,
      type,
      memberId,
      revoked: false,
    };

    await this.tokenRepository.insert(token);

    return token;
  }

  async verifyAuthenticationToken(tokenValue: string): Promise<Token> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (token === undefined) {
      throw new TokenNotFound(tokenValue);
    }

    if (isAfter(this.dateAdapter.now(), token.expirationDate)) {
      throw new TokenExpired(tokenValue);
    }

    this.events.emit(new MemberAuthenticated(token.memberId));

    await this.tokenRepository.revoke(token.id);

    return this.generateToken(TokenType.session, token.memberId);
  }

  async getMemberIdFromToken(tokenValue: string, type?: TokenType): Promise<string | undefined> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (!token) {
      return undefined;
    }

    if (type === undefined || token.type === type) {
      return token.memberId;
    }
  }

  async revokeToken(tokenValue: string, type?: TokenType): Promise<void> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (!token || (type && token.type !== type)) {
      return;
    }

    await this.tokenRepository.revoke(token.id);

    if (type === TokenType.session) {
      this.events.emit(new MemberUnauthenticated(token.memberId));
    }
  }
}
