import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { comments, members, requests } from '../infrastructure/persistence/schema';
import { createSqlMember, createSqlRequest } from '../infrastructure/persistence/sql-factories';
import { RepositoryTest } from '../repository-test';

import { SqlCommentsRepository } from './sql-comments.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  repository = new SqlCommentsRepository(this.database, this.dateAdapter);

  get now() {
    return this.dateAdapter.now();
  }

  async setup() {
    this.dateAdapter.date = createDate('2023-01-01');

    await this.database.migrate();
    await this.database.reset();
  }
}

describe('SQLCommentsRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = await Test.create(Test);
  });

  it('creates a new comment linked to a request', async () => {
    await test.database.db.insert(members).values(createSqlMember({ id: 'authorId' }));
    await test.database.db.insert(requests).values(createSqlRequest({ id: 'requestId' }));

    await test.repository.insert('request', 'requestId', {
      id: 'commentId',
      authorId: 'authorId',
      body: 'body',
      date: createDate('2023-01-01'),
    });

    expect(await test.database.db.select().from(comments)).toEqual([
      {
        id: 'commentId',
        authorId: 'authorId',
        requestId: 'requestId',
        date: createDate('2023-01-01'),
        body: 'body',
        createdAt: test.now,
        updatedAt: test.now,
      },
    ]);
  });
});