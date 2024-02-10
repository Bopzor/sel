import { createDate } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { Token, TokenType } from '../../../authentication/token.entity';
import { StubDate } from '../../../infrastructure/date/stub-date.adapter';
import { RepositoryTest } from '../../../repository-test';
import { members, tokens } from '../../schema';
import { createSqlMember, createSqlToken } from '../../sql-factories';

import { SqlTokenRepository } from './sql-token.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  repository = new SqlTokenRepository(this.database, this.dateAdapter);

  async setup() {
    this.dateAdapter.date = createDate('2023-01-01');

    await this.database.migrate();
    await this.database.db.delete(tokens);
    await this.database.db.delete(members);
  }
}

describe('[Intg] SqlTokenRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = await Test.create(Test);
  });

  describe('findByValue', () => {
    beforeEach(async () => {
      await test.database.db.insert(members).values(createSqlMember({ id: 'memberId' }));
    });

    it('retrieves a token from its value', async () => {
      await test.database.db
        .insert(tokens)
        .values(createSqlToken({ id: 'tokenId', memberId: 'memberId', value: 'value' }));

      const token = await test.repository.findByValue('value');

      expect(token).toHaveProperty('id', 'tokenId');
    });

    it('returns undefined when no token with the given value exists', async () => {
      const token = await test.repository.findByValue('value');

      expect(token).toBeUndefined();
    });

    it('returns undefined when a revoked token with the given value exists', async () => {
      await test.database.db.insert(tokens).values(
        createSqlToken({
          value: 'value',
          memberId: 'memberId',
          revoked: true,
        }),
      );

      const token = await test.repository.findByValue('value');

      expect(token).toBeUndefined();
    });
  });

  describe('findByMemberId', () => {
    it('retrieves a token from a memberId and type', async () => {
      await test.database.db.insert(members).values(createSqlMember({ id: 'memberId' }));

      await test.database.db
        .insert(tokens)
        .values(createSqlToken({ id: 'tokenId', memberId: 'memberId', type: TokenType.session }));

      const token = await test.repository.findByMemberId('memberId', TokenType.session);

      expect(token).toHaveProperty('id', 'tokenId');
    });

    it('resolves with undefined when there is no token associated with the memberId', async () => {
      await expect(test.repository.findByMemberId('memberId', TokenType.session)).resolves.toBeUndefined();
    });
  });

  it('persists a token', async () => {
    const token: Token = {
      id: 'id',
      value: 'value',
      expirationDate: createDate('2023-01-02'),
      type: TokenType.authentication,
      memberId: 'memberId',
      revoked: false,
    };

    await test.database.db.insert(members).values(
      createSqlMember({
        id: 'memberId',
      }),
    );

    await test.repository.insert(token);

    await expect(test.database.db.select().from(tokens)).resolves.toEqual([
      {
        ...token,
        memberId: 'memberId',
        createdAt: test.dateAdapter.date,
        updatedAt: test.dateAdapter.date,
      },
    ]);
  });

  it('revokes a token', async () => {
    await test.database.db.insert(members).values(createSqlMember({ id: 'memberId' }));

    await test.database.db
      .insert(tokens)
      .values(createSqlToken({ id: 'tokenId', memberId: 'memberId', revoked: false }));

    await expect(test.repository.revoke('tokenId')).resolves.toBeUndefined();

    const [sqlToken] = await test.database.db.select().from(tokens).where(eq(tokens.id, 'tokenId'));

    expect(sqlToken).toHaveProperty('revoked', true);
  });
});
