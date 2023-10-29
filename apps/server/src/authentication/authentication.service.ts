import { Duration, addDuration, isAfter } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../infrastructure/config/config.port';
import { DatePort } from '../infrastructure/date/date.port';
import { EmailPort } from '../infrastructure/email/email.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
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
    TOKENS.email,
    TOKENS.tokenRepository,
    TOKENS.membersFacade
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly emailAdapter: EmailPort,
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
    const memberId = await this.memberFacade.getMemberIdFromEmail(email);

    if (!memberId) {
      return;
    }

    const token = await this.generateToken(TokenType.authentication, memberId);

    const authenticationUrl = new URL(this.config.app.baseUrl);
    authenticationUrl.searchParams.set('auth-token', token.value);

    await this.emailAdapter.send({
      to: email,
      subject: "SEL'ons-nous - Lien de connexion",
      body: {
        text: `Authentication link: ${authenticationUrl}`,
        html: '',
      },
    });
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
}
