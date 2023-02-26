import { InMemoryRepository } from '../../common/in-memory-repository';

import { Request } from './entities/request.entity';
import { RequestRepository } from './request.repository';
import { GetRequestResult } from './use-cases/get-request/get-request-result';
import { ListRequestsResult } from './use-cases/list-requests/list-requests-result';

export class InMemoryRequestRepository extends InMemoryRepository<Request> implements RequestRepository {
  async listRequests(search?: string): Promise<ListRequestsResult> {
    return this.all()
      .filter(({ title, description }) => {
        if (!search) {
          return true;
        }

        const regexp = new RegExp(search, 'i');

        return title.search(regexp) >= 0 || description.search(regexp) >= 0;
      })
      .map((request) => ({
        id: request.id,
        title: request.title,
        description: request.description,
        creationDate: request.creationDate.toString(),
        lastEditionDate: request.lastEditionDate.toString(),
      }));
  }

  async getRequest(id: string): Promise<GetRequestResult | undefined> {
    const request = this.get(id);

    if (!request) {
      return;
    }

    return {
      id: request.id,
      title: request.title,
      description: request.description,
      creationDate: request.creationDate.toString(),
      lastEditionDate: request.lastEditionDate.toString(),
    };
  }
}
