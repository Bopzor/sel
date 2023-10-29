import * as shared from '@sel/shared';
import { createDate, createFactory, getId } from '@sel/utils';
import { InferInsertModel } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../infrastructure/config/stub-config.adapter';
import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';

import { SqlMembersRepository } from './sql-members.repository';

const createSqlMember = createFactory<InferInsertModel<typeof members>>(() => ({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  createdAt: createDate().toISOString(),
  updatedAt: createDate().toISOString(),
}));

describe('SqlMembersRepository', () => {
  let database: Database;
  let repository: SqlMembersRepository;

  beforeEach(async () => {
    await Database.ensureTestDatabase();

    const config = new StubConfigAdapter({
      database: {
        url: 'postgres://postgres@localhost:5432/test',
      },
    });

    database = new Database(config);
    repository = new SqlMembersRepository(database);

    await database.migrate();

    await database.db.delete(members);

    await database.db.insert(members).values(
      createSqlMember({
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        phoneNumbers: ['phoneNumbers'],
        bio: 'bio',
        address: {
          line1: 'line1',
          line2: 'line2',
          postalCode: 'postalCode',
          city: 'city',
          country: 'country',
          position: [0, 1],
        },
      }),
    );
  });

  it('queries the list of all members', async () => {
    const results = await repository.listMembers(shared.MembersSort.firstName);

    expect(results).toEqual<shared.Member[]>([
      {
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        phoneNumbers: ['phoneNumbers'],
        bio: 'bio',
        address: {
          line1: 'line1',
          line2: 'line2',
          postalCode: 'postalCode',
          city: 'city',
          country: 'country',
          position: [0, 1],
        },
      },
    ]);
  });

  it('queries the list of all members sorted by last name', async () => {
    await database.db.insert(members).values(createSqlMember({ id: 'id2', lastName: 'aaa' }));

    const results = await repository.listMembers(shared.MembersSort.lastName);

    expect(results.map(getId)).toEqual(['id2', 'id']);
  });

  it('queries a member from its id', async () => {
    const results = await repository.getMember('id');

    expect(results).toEqual<shared.Member>({
      id: 'id',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      phoneNumbers: ['phoneNumbers'],
      bio: 'bio',
      address: {
        line1: 'line1',
        line2: 'line2',
        postalCode: 'postalCode',
        city: 'city',
        country: 'country',
        position: [0, 1],
      },
    });
  });

  it('does not find a member from its id', async () => {
    const results = await repository.getMember('not-id');

    expect(results).toBeUndefined();
  });
});
