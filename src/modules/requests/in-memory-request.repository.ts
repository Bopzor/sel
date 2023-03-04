import { InMemoryRepository } from '../../common/in-memory-repository';
import { assert } from '../../utils/assert';
import { Member } from '../members/entities/member.entity';

import { Request } from './entities/request.entity';
import { RequestRepository } from './request.repository';
import { GetRequestResult } from './use-cases/get-request/get-request-result';
import { ListRequestsResult } from './use-cases/list-requests/list-requests-result';

export class InMemoryRequestRepository extends InMemoryRepository<Request> implements RequestRepository {
  protected entity = Request;

  async listRequests(search?: string): Promise<ListRequestsResult> {
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

        return {
          id: request.id,
          requester: {
            id: requester.id,
            name: requester.fullName,
            email: requester.email,
          },
          title: request.title,
          description: request.description,
          creationDate: request.creationDate.toString(),
          lastEditionDate: request.lastEditionDate.toString(),
        };
      });
  }

  async getRequest(id: string): Promise<GetRequestResult | undefined> {
    const request = this.get(id);

    if (!request) {
      return;
    }

    const members = this.db.getEntities(Member);
    const requester = members.get(request.requesterId);

    assert(requester, `expected member "${request.requesterId}" to be defined`);

    return {
      id: request.id,
      requester: {
        id: requester.id,
        name: requester.fullName,
        email: requester.email,
      },
      title: request.title,
      description: request.description,
      creationDate: request.creationDate.toString(),
      lastEditionDate: request.lastEditionDate.toString(),
    };
  }
}
