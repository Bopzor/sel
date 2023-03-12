import { RepositoryTest } from '../../../../common/repository-test';
import { create } from '../../factories';

import { SqlMemberRepository } from './sql-member.repository';

describe('SqlMemberRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = new Test();
    await test.setup();
  });

  afterEach(async () => {
    await test.cleanup();
  });

  describe('listMembers', () => {
    it('retrieves the list of all members', async () => {
      const repository = test.repository;

      await repository.save(create.member({ id: 'memberId' }));

      const results = await repository.listMembers();

      expect(results).toHaveLength(1);
      expect(results).toHaveProperty('0.id', 'memberId');
    });

    it('retrieves the list of members matching a search query', async () => {
      const repository = test.repository;

      const members = [
        create.member({ id: 'memberId1', firstName: 'Alice' }),
        create.member({ id: 'memberId2', lastName: 'Oua' }),
        create.member({ id: 'memberId3', email: 'tata@domain.tld' }),
        create.member({ id: 'memberId4', firstName: 'Bob' }),
      ];

      for (const member of members) {
        await repository.save(member);
      }

      const results = await repository.listMembers('a');

      expect(results).toHaveLength(3);
    });
  });

  describe('getMember', () => {
    it('retrieves a single member from its id', async () => {
      const repository = test.repository;

      await repository.save(create.member({ id: 'memberId' }));

      const result = await repository.getMember('memberId');

      expect(result).toHaveProperty('id', 'memberId');
    });

    it('resolves undefined when the given id does not exist', async () => {
      const repository = test.repository;

      const result = await repository.getMember('memberId');

      expect(result).toBeUndefined();
    });
  });
});

class Test extends RepositoryTest {
  get repository() {
    return new SqlMemberRepository(this.orm);
  }
}
