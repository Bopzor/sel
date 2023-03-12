import { injected } from 'brandi';

import { TOKENS } from '../../../../api/tokens';
import { InMemoryRepository } from '../../../../common/in-memory-repository';
import { assert } from '../../../../utils/assert';
import { Member } from '../../../members/entities/member.entity';
import { Request } from '../../entities/request.entity';
import { Request as RequestResult, transformRequest } from '../../index';

import { RequestRepository } from './request.repository';

export class InMemoryRequestRepository extends InMemoryRepository<Request> implements RequestRepository {
  protected entity = Request;

  async listRequests(search?: string): Promise<RequestResult[]> {
    return this.all()
      .filter(({ title, description }) => {
        if (!search) {
          return true;
        }

        const regexp = new RegExp(search, 'i');

        return title.search(regexp) >= 0 || description.search(regexp) >= 0;
      })
      .map((request) => {
        const members = this.db.getEntities(Member);
        const requester = members.get(request.requesterId);

        assert(requester, `expected member "${request.requesterId}" to be defined`);

        return transformRequest(request, requester);
      });
  }

  async getRequest(id: string): Promise<RequestResult | undefined> {
    const request = this.get(id);

    if (!request) {
      return;
    }

    const members = this.db.getEntities(Member);
    const requester = members.get(request.requesterId);

    assert(requester, `expected member "${request.requesterId}" to be defined`);

    return transformRequest(request, requester);
  }
}

injected(InMemoryRequestRepository, TOKENS.inMemoryDatabase);
