import { Token, TokenType } from '../../../authentication/token.entity';

export type TokenQueryResult = {
  value: string;
  expirationDate: Date;
};

export interface TokenRepository {
  query_findById(tokenId: string, type: TokenType): Promise<TokenQueryResult | undefined>;
  findByValue(tokenValue: string): Promise<Token | undefined>;
  findByMemberId(memberId: string, type: TokenType): Promise<Token | undefined>;
  insert(token: Token): Promise<void>;
  revoke(tokenId: string): Promise<void>;
}
