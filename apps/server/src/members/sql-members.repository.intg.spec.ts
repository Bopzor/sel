import * as shared from '@sel/shared';
import { createDate, getId } from '@sel/utils';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { members, tokens } from '../infrastructure/persistence/schema';
import { createSqlMember } from '../infrastructure/persistence/sql-factories';
import { RepositoryTest } from '../repository-test';

import { MemberStatus } from './entities';
import { SqlMembersRepository } from './sql-members.repository';

class Test extends RepositoryTest {
  dateAdapter = new StubDate();
  repository = new SqlMembersRepository(this.database, this.dateAdapter);

  async setup() {
    this.dateAdapter.date = createDate('2023-01-01');

    await this.database.migrate();
    await this.database.db.delete(tokens);
    await this.database.db.delete(members);
  }
}

describe('[Intg] SqlMembersRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = await Test.create(Test);

    await test.database.db.insert(members).values(
      createSqlMember({
        id: 'id',
        status: MemberStatus.active,
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

  describe('query_listMembers', () => {
    it('queries the list of all members', async () => {
      const results = await test.repository.query_listMembers(shared.MembersSort.firstName);

      expect(results).toEqual<shared.Member[]>([
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

    it('queries the list of all members sorted by last name', async () => {
      await test.database.db
        .insert(members)
        .values(createSqlMember({ id: 'id2', status: MemberStatus.active, lastName: 'aaa' }));

      const results = await test.repository.query_listMembers(shared.MembersSort.lastName);

      expect(results.map(getId)).toEqual(['id2', 'id']);
    });

    it('excludes inactive members', async () => {
      await test.database.db
        .update(members)
        .set({ status: MemberStatus.inactive })
        .where(eq(members.id, 'id'));

      const results = await test.repository.query_listMembers(shared.MembersSort.firstName);

      expect(results).toHaveLength(0);
    });
  });

  describe('query_getMember', () => {
    it('queries a member from its id', async () => {
      const result = await test.repository.query_getMember('id');

      expect(result).toEqual<shared.Member>({
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

    it('returns undefined when the member is inactive', async () => {
      await test.database.db
        .update(members)
        .set({ status: MemberStatus.inactive })
        .where(eq(members.id, 'id'));

      await expect(test.repository.query_getMember('id')).resolves.toBeUndefined();
    });

    it('hides the email when not visible', async () => {
      await test.database.db
        .update(members)
        .set({
          emailVisible: false,
        })
        .where(eq(members.id, 'id'));

      const result = await test.repository.query_getMember('id');

      expect(result).toHaveProperty('email', undefined);
    });

    it('hides phones numbers that are not visible', async () => {
      await test.database.db
        .update(members)
        .set({
          phoneNumbers: [
            { number: 'visible', visible: true },
            { number: 'private', visible: false },
          ] satisfies shared.PhoneNumber[],
        })
        .where(eq(members.id, 'id'));

      const result = await test.repository.query_getMember('id');

      expect(result).toHaveProperty('phoneNumbers', [{ number: 'visible', visible: true }]);
    });
  });

  describe('getMember', () => {
    it('does not find a member from its id', async () => {
      const results = await test.repository.getMember('not-id');

      expect(results).toBeUndefined();
    });
  });

  describe('getMemberFromEmail', () => {
    it('retrieves a member from its email', async () => {
      const member = await test.repository.getMemberFromEmail('email');

      expect(member).toHaveProperty('id', 'id');
    });

    it('resolves with undefined when the email does not exist', async () => {
      const member = await test.repository.getMemberFromEmail('does-not-exist');

      expect(member).toBeUndefined();
    });
  });
});
