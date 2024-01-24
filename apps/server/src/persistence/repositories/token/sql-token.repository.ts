import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';

import { Token, TokenType } from '../../../authentication/token.entity';
import { DatePort } from '../../../infrastructure/date/date.port';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { tokens } from '../../schema';

import { TokenQueryResult, TokenRepository } from './token.repository';

export class SqlTokenRepository implements TokenRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  private get db() {
    return this.database.db;
  }

  private get tx() {
    return this.database.transaction;
  }

  async query_findById(tokenId: string, type: TokenType): Promise<TokenQueryResult | undefined> {
    const [sqlToken] = await this.db
      .select()
      .from(tokens)
      .where(and(eq(tokens.id, tokenId), eq(tokens.type, type), eq(tokens.revoked, false)));

    if (!sqlToken) {
      return undefined;
    }

    return {
      value: sqlToken.value,
      expirationDate: sqlToken.expirationDate,
    };
  }

  async findByValue(value: string): Promise<Token | undefined> {
    const [sqlToken] = await this.tx
      .select()
      .from(tokens)
      .where(and(eq(tokens.value, value), eq(tokens.revoked, false)));

    if (!sqlToken) {
      return undefined;
    }

    return this.toEntity(sqlToken);
  }

  async findByMemberId(memberId: string, type: TokenType): Promise<Token | undefined> {
    const [sqlToken] = await this.tx
      .select()
      .from(tokens)
      .where(and(eq(tokens.memberId, memberId), eq(tokens.type, type), eq(tokens.revoked, false)));

    if (!sqlToken) {
      return undefined;
    }

    return this.toEntity(sqlToken);
  }

  private toEntity(sqlToken: typeof tokens.$inferSelect): Token {
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

    await this.tx.insert(tokens).values({
      ...token,
      expirationDate: token.expirationDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  async revoke(tokenId: string): Promise<void> {
    await this.tx.update(tokens).set({ revoked: true }).where(eq(tokens.id, tokenId));
  }
}
