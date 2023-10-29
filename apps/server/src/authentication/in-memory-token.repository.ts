import { InMemoryRepository } from '../in-memory.repository';

import { Token } from './token.entity';
import { TokenRepository } from './token.repository';

export class InMemoryTokenRepository extends InMemoryRepository<Token> implements TokenRepository {
  async findByValue(tokenValue: string): Promise<Token | undefined> {
    return this.find((token) => token.value === tokenValue);
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
