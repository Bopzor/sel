import { Duration, addDuration, isAfter } from '@sel/utils';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';

import { TokenType, Token } from './token.entity';
import { TokenRepository } from './token.repository';

export class AuthenticationService {
  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly tokenRepository: TokenRepository
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
      throw new Error('token does not exist');
    }

    if (isAfter(this.dateAdapter.now(), token.expirationDate)) {
      throw new Error('token has expired');
    }

    await this.tokenRepository.revoke(token.id);

    return this.generateToken(TokenType.session, 'memberId');
  }
}
