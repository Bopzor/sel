import { createDate } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../infrastructure/config/stub-config.adapter';
import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { Database } from '../infrastructure/persistence/database';
import { members, tokens } from '../infrastructure/persistence/schema';
import { createSqlMember, createSqlToken } from '../infrastructure/persistence/sql-factories';

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
    await database.db.delete(members);
  });

  describe('findByValue', () => {
    it('returns undefined when no token with the given value exists', async () => {
      const token = await repository.findByValue('value');

      expect(token).toBeUndefined();
    });

    it('retrieves a token from its value', async () => {
      await database.db.insert(tokens).values(createSqlToken({ id: 'tokenId', value: 'value' }));

      const token = await repository.findByValue('value');

      expect(token).toHaveProperty('id', 'tokenId');
    });
  });

  it('persists a token', async () => {
    const token: Token = {
      id: 'id',
      value: 'value',
      expirationDate: createDate(),
      type: TokenType.authentication,
      memberId: 'memberId',
      revoked: false,
    };

    await database.db.insert(members).values(
      createSqlMember({
        id: 'memberId',
      })
    );

    await repository.insert(token);

    await expect(database.db.select().from(tokens)).resolves.toEqual([
      {
        ...token,
        memberId: 'memberId',
        createdAt: dateAdapter.date,
        updatedAt: dateAdapter.date,
      },
    ]);
  });

  it('revokes a token', async () => {
    await database.db.insert(tokens).values(createSqlToken({ id: 'tokenId', revoked: false }));

    await expect(repository.revoke('tokenId')).resolves.toBeUndefined();

    const [sqlToken] = await database.db.select().from(tokens).where(eq(tokens.id, 'tokenId'));

    expect(sqlToken).toHaveProperty('revoked', true);
  });
});
