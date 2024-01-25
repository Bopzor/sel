import { injectableClass } from 'ditox';

import { TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { TokenType } from '../token.entity';

export type GetTokenQuery = {
  tokenId: string;
  type: TokenType;
};

export class GetToken {
  static inject = injectableClass(this, TOKENS.tokenRepository);

  constructor(private readonly tokenRepository: TokenRepository) {}

  async handle({ tokenId, type }: GetTokenQuery) {
    return this.tokenRepository.query_findById(tokenId, type);
  }
}
