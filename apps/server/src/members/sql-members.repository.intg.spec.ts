import { MembersSort, Member, PhoneNumber } from '@sel/shared';
import { getId } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../infrastructure/config/stub-config.adapter';
import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { Database } from '../infrastructure/persistence/database';
import { members } from '../infrastructure/persistence/schema';
import { createSqlMember } from '../infrastructure/persistence/sql-factories';

import { SqlMembersRepository } from './sql-members.repository';

describe('[Intg] SqlMembersRepository', () => {
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
    repository = new SqlMembersRepository(database, new StubDate());

    await database.migrate();
    await database.reset();

    await database.db.insert(members).values(
      createSqlMember({
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        emailVisible: true,
        phoneNumbers: [],
        bio: 'bio',
        address: {
          line1: 'line1',
          line2: 'line2',
          postalCode: 'postalCode',
          city: 'city',
          country: 'country',
          position: [0, 1],
        },
      })
    );
  });

  it('retrieves the list of all members', async () => {
    const results = await repository.listMembers(MembersSort.firstName);

    expect(results).toEqual<Member[]>([
      {
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        phoneNumbers: [],
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

  it('retrieves the list of all members sorted by last name', async () => {
    await database.db.insert(members).values(createSqlMember({ id: 'id2', lastName: 'aaa' }));

    const results = await repository.listMembers(MembersSort.lastName);

    expect(results.map(getId)).toEqual(['id2', 'id']);
  });

  it('retrieves a member from its id', async () => {
    const result = await repository.getMember('id');

    expect(result).toEqual<Member>({
      id: 'id',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      phoneNumbers: [],
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

  it('hides the email when not visible', async () => {
    await database.db
      .update(members)
      .set({
        emailVisible: false,
      })
      .where(eq(members.id, 'id'));

    const result = await repository.getMember('id');

    expect(result).toHaveProperty('email', undefined);
  });

  it('hides phones numbers that are not visible', async () => {
    await database.db
      .update(members)
      .set({
        phoneNumbers: [
          { number: 'visible', visible: true },
          { number: 'private', visible: false },
        ] satisfies PhoneNumber[],
      })
      .where(eq(members.id, 'id'));

    const result = await repository.getMember('id');

    expect(result).toHaveProperty('phoneNumbers', [{ number: 'visible', visible: true }]);
  });

  it('does not find a member from its id', async () => {
    const results = await repository.getMember('not-id');

    expect(results).toBeUndefined();
  });

  it('retrieves a member from its email', async () => {
    const member = await repository.getMemberFromEmail('email');

    expect(member).toHaveProperty('id', 'id');
  });

  it('resolves with undefined when the email does not exist', async () => {
    const member = await repository.getMemberFromEmail('does-not-exist');

    expect(member).toBeUndefined();
  });
});
