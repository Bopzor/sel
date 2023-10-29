import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { tokens } from '../infrastructure/persistence/schema';

import { Token } from './token.entity';
import { TokenRepository } from './token.repository';

export class SqlTokenRepository implements TokenRepository {
  constructor(
    private readonly database: Database,
    private readonly dateAdapter: DatePort,
  ) {}

  async create(token: Token): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(tokens).values({
      ...token,
      expirationDate: token.expirationDate.toISOString(),
      createdAt: now,
      updatedAt: now,
    });
  }
}
