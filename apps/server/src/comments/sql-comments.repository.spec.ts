import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { FakeHtmlParserAdapter } from '../infrastructure/html-parser/fake-html-parser.adapter';
import { comments, members, requests } from '../infrastructure/persistence/schema';
import { createSqlMember, createSqlRequest } from '../infrastructure/persistence/sql-factories';
import { RepositoryTest } from '../repository-test';

import { SqlCommentsRepository } from './sql-comments.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  htmlParser = new FakeHtmlParserAdapter();
  repository = new SqlCommentsRepository(this.database, this.dateAdapter, this.htmlParser);

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
    await test.database.db.insert(members).values(createSqlMember({ id: 'memberId' }));

    await test.database.db
      .insert(requests)
      .values(createSqlRequest({ id: 'requestId', requesterId: 'memberId' }));

    await test.repository.insert('request', 'requestId', {
      id: 'commentId',
      authorId: 'memberId',
      entityId: 'requestId',
      text: 'body',
      date: createDate('2023-01-01'),
    });

    expect(await test.database.db.select().from(comments)).toEqual<Array<typeof comments.$inferSelect>>([
      {
        id: 'commentId',
        authorId: 'memberId',
        requestId: 'requestId',
        date: createDate('2023-01-01'),
        html: 'body',
        text: 'text content of body',
        createdAt: test.now,
        updatedAt: test.now,
      },
    ]);
  });
});
