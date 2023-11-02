import { InMemoryRepository } from '../in-memory.repository';

import { Token, TokenType } from './token.entity';
import { TokenRepository } from './token.repository';

export class InMemoryTokenRepository extends InMemoryRepository<Token> implements TokenRepository {
  async findByValue(tokenValue: string): Promise<Token | undefined> {
    return this.find((token) => !token.revoked && token.value === tokenValue);
  }

  async findByMemberId(memberId: string, type: TokenType): Promise<Token | undefined> {
    return this.find((token) => !token.revoked && token.memberId === memberId && token.type === type);
  }

  async insert(token: Token): Promise<void> {
    this.add(token);
  }

  async revoke(tokenId: string): Promise<void> {
    const token = this.get(tokenId);

    if (token) {
      this.add({
        ...token,
        revoked: true,
      });
    }
  }
}
