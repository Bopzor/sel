import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { tokens } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { Token } from './token.entity';
import { TokenRepository } from './token.repository';

export class SqlTokenRepository implements TokenRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async findByValue(value: string): Promise<Token | undefined> {
    const [sqlToken] = await this.database.db.select().from(tokens).where(eq(tokens.value, value));

    if (!sqlToken) {
      return undefined;
    }

    return {
      id: sqlToken.id,
      value: sqlToken.value,
      expirationDate: new Date(sqlToken.expirationDate),
      type: sqlToken.type,
      memberId: sqlToken.memberId,
      revoked: sqlToken.revoked,
    };
  }

  async insert(token: Token): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(tokens).values({
      ...token,
      expirationDate: token.expirationDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  async revoke(tokenId: string): Promise<void> {
    await this.database.db.update(tokens).set({ revoked: true }).where(eq(tokens.id, tokenId));
  }
}
