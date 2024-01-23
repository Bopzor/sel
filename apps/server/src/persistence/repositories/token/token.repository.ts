import { Token, TokenType } from '../../../authentication/token.entity';

export interface TokenRepository {
  findByValue(tokenValue: string): Promise<Token | undefined>;
  findByMemberId(memberId: string, type: TokenType): Promise<Token | undefined>;
  insert(token: Token): Promise<void>;
  revoke(tokenId: string): Promise<void>;
}
