import { RepositoryTest } from '../../../../common/repository-test';
import { SqlMemberRepository } from '../../../members/api/repositories/sql-member.repository';
import { create as memberFactories } from '../../../members/factories';
import { create } from '../../factories';

import { SqlRequestRepository } from './sql-request.repository';

describe('SqlRequestRepository', () => {
  let test: Test;

  beforeEach(async () => {
    test = new Test();
    await test.setup();
  });

  afterEach(async () => {
    await test.cleanup();
  });

  describe('listRequests', () => {
    it('retrieves the list of all requests', async () => {
      const repository = test.repository;

      await repository.save(create.request({ id: 'requestId', requesterId: 'memberId' }));

      const results = await repository.listRequests();

      expect(results).toHaveLength(1);
      expect(results).toHaveProperty('0.id', 'requestId');
    });

    it('retrieves the list of requests matching a search query', async () => {
      const repository = test.repository;

      const requests = [
        create.request({ id: 'requestId1', requesterId: 'memberId', title: 'Boubou' }),
        create.request({ id: 'requestId2', requesterId: 'memberId', description: 'Bibi' }),
        create.request({ id: 'requestId3', requesterId: 'memberId', title: 'Toto' }),
      ];

      for (const request of requests) {
        await repository.save(request);
      }

      const results = await repository.listRequests('b');

      expect(results).toHaveLength(2);
    });
  });

  describe('getRequest', () => {
    it('retrieves a single request from its id', async () => {
      const repository = test.repository;

      await repository.save(create.request({ id: 'requestId', requesterId: 'memberId' }));

      const result = await repository.getRequest('requestId');

      expect(result).toHaveProperty('id', 'requestId');
    });

    it('resolves undefined when the given id does not exist', async () => {
      const repository = test.repository;

      const result = await repository.getRequest('requestId');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('retrieves a single request from its id', async () => {
      const repository = test.repository;

      await repository.save(create.request({ id: 'requestId', requesterId: 'memberId' }));

      const result = await repository.findById('requestId');

      expect(result).toHaveProperty('id', 'requestId');
    });

    it('resolves undefined when the given id does not exist', async () => {
      const repository = test.repository;

      const result = await repository.findById('requestId');

      expect(result).toBeUndefined();
    });
  });

  describe('edit request', () => {
    it('edits a given request', async () => {
      const repository = test.repository;

      const request = create.request({ id: 'requestId', requesterId: 'memberId' });
      await repository.save(request);

      request.title = 'edited';
      await repository.save(request);

      const result = await repository.findById('requestId');

      expect(result).toHaveProperty('title', 'edited');
    });
  });
});

class Test extends RepositoryTest {
  member = memberFactories.member({ id: 'memberId' });

  async arrange() {
    await this.memberRepository.save(this.member);
  }

  get memberRepository() {
    return new SqlMemberRepository(this.orm);
  }

  get repository() {
    return new SqlRequestRepository(this.orm);
  }
}
