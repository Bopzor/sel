import * as shared from '@sel/shared';
import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { members, requests } from '../infrastructure/persistence/schema';
import { createSqlMember, createSqlRequest } from '../infrastructure/persistence/sql-factories';
import { RepositoryTest } from '../repository-test';

import { SqlRequestRepository } from './sql-request.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  repository = new SqlRequestRepository(this.database, this.dateAdapter);

  get now() {
    return this.dateAdapter.now();
  }

  async setup() {
    this.dateAdapter.date = createDate('2023-01-01');

    await this.database.migrate();
    await this.database.reset();
  }
}

describe('SqlRequestRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = await Test.create(Test);
  });

  it('queries the list of all requests', async () => {
    await test.database.db.insert(members).values(
      createSqlMember({
        id: 'requesterId',
      })
    );

    await test.database.db.insert(requests).values(
      createSqlRequest({
        id: 'requestId',
        requesterId: 'requesterId',
      })
    );

    const result = await test.repository.query_listRequests();

    expect(result).toEqual<shared.Request[]>([
      expect.objectContaining({
        id: 'requestId',
        requester: expect.objectContaining({
          id: 'requesterId',
        }),
      }),
    ]);
  });

  it('queries a request from its id', async () => {
    await test.database.db.insert(members).values(
      createSqlMember({
        id: 'requesterId',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        emailVisible: false,
        phoneNumbers: [
          { number: 'number', visible: true },
          { number: 'private', visible: false },
        ],
      })
    );

    await test.database.db.insert(requests).values(
      createSqlRequest({
        id: 'requestId',
        requesterId: 'requesterId',
        date: test.now,
        title: 'title',
        html: 'html',
      })
    );

    const result = await test.repository.query_getRequest('requestId');

    expect(result).toEqual<shared.Request>({
      id: 'requestId',
      date: test.now.toISOString(),
      requester: {
        id: 'requesterId',
        firstName: 'firstName',
        lastName: 'lastName',
        phoneNumbers: [{ number: 'number', visible: true }],
      },
      title: 'title',
      body: 'html',
      comments: [],
    });
  });
});