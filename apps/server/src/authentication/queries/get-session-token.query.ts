import { injectableClass } from 'ditox';

import { TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { TokenType } from '../token.entity';

export class GetToken {
  static inject = injectableClass(this, TOKENS.tokenRepository);

  constructor(private readonly tokenRepository: TokenRepository) {}

  async handle(tokenId: string, type: TokenType) {
    return this.tokenRepository.query_findById(tokenId, type);
  }
}
