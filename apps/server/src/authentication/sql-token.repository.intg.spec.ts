import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../infrastructure/config/stub-config.adapter';
import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { Database } from '../infrastructure/persistence/database';
import { tokens } from '../infrastructure/persistence/schema';

import { SqlTokenRepository } from './sql-token.repository';
import { Token, TokenType } from './token.entity';

describe('SqlTokenRepository', () => {
  let database: Database;
  let dateAdapter: StubDate;
  let repository: SqlTokenRepository;

  beforeEach(async () => {
    await Database.ensureTestDatabase();

    const config = new StubConfigAdapter({
      database: {
        url: 'postgres://postgres@localhost:5432/test',
      },
    });

    database = new Database(config);
    dateAdapter = new StubDate();
    repository = new SqlTokenRepository(database, dateAdapter);

    dateAdapter.date = createDate('2023-01-01');

    await database.migrate();
    await database.db.delete(tokens);
  });

  it('persists a token', async () => {
    const token: Token = {
      id: 'id',
      value: 'value',
      expirationDate: createDate(),
      type: TokenType.authentication,
    };

    await repository.create(token);

    await expect(database.db.select().from(tokens)).resolves.toEqual([
      {
        ...token,
        createdAt: dateAdapter.date,
        updatedAt: dateAdapter.date,
      },
    ]);
  });
});