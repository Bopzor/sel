import { injectableClass } from 'ditox';

import { QueryHandler } from '../../infrastructure/cqs/query-handler';
import { TokenQueryResult, TokenRepository } from '../../persistence/repositories/token/token.repository';
import { TOKENS } from '../../tokens';
import { TokenType } from '../token.entity';

export type GetTokenQuery = {
  tokenId: string;
  type: TokenType;
};

export type GetTokenQueryResult = TokenQueryResult | undefined;

export class GetToken implements QueryHandler<GetTokenQuery, GetTokenQueryResult> {
  static inject = injectableClass(this, TOKENS.tokenRepository);

  constructor(private readonly tokenRepository: TokenRepository) {}

  async handle({ tokenId, type }: GetTokenQuery): Promise<GetTokenQueryResult> {
    return this.tokenRepository.query_findById(tokenId, type);
  }
}
