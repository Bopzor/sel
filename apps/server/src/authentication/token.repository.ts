import { Token } from './token.entity';

export interface TokenRepository {
  findByValue(tokenValue: string): Promise<Token | undefined>;
  insert(token: Token): Promise<void>;
  revoke(tokenId: string): Promise<void>;
}
