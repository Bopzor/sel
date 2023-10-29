import { addDuration } from '@sel/utils';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';

import { TokenType, Token } from './token.entity';

export class AuthenticationService {
  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
  ) {}

  generateToken(type: TokenType): Token {
    const expirationDate = addDuration(this.dateAdapter.now(), { hours: 1 });

    return {
      id: this.generator.id(),
      value: this.generator.token(24),
      expirationDate,
      type: TokenType.authentication,
    };
  }
}
