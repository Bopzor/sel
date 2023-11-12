import { Duration, addDuration, isAfter } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../infrastructure/config/config.port';
import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { AuthenticationLinkRequested } from '../members/events';
import { MembersFacade } from '../members/members.facade';
import { TOKENS } from '../tokens';

import { Token, TokenType } from './token.entity';
import { TokenRepository } from './token.repository';

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

  async requestAuthenticationLink(email: string): Promise<void> {
    const member = await this.memberFacade.getMemberFromEmail(email);

    if (!member) {
      return;
    }

    const previousToken = await this.tokenRepository.findByMemberId(member.id, TokenType.authentication);

    if (previousToken) {
      await this.tokenRepository.revoke(previousToken.id);
    }

    const token = await this.generateToken(TokenType.authentication, member.id);

    const authenticationUrl = new URL(this.config.app.baseUrl);
    authenticationUrl.searchParams.set('auth-token', token.value);

    this.events.emit(new AuthenticationLinkRequested(member.id, authenticationUrl.toString()));
  }

  async verifyAuthenticationToken(tokenValue: string): Promise<Token> {
    const token = await this.tokenRepository.findByValue(tokenValue);

    if (token === undefined) {
      throw new Error('token does not exist');
    }

    if (isAfter(this.dateAdapter.now(), token.expirationDate)) {
      throw new Error('token has expired');
    }

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
  }
}
