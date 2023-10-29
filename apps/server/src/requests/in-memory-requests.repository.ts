import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { InMemoryRepository } from '../in-memory.repository';
import { MembersRepository } from '../members/members.repository';
import { TOKENS } from '../tokens';

import { Request } from './entities/request';
import { RequestsRepository } from './requests.repository';

export class InMemoryRequestsRepository extends InMemoryRepository<Request> implements RequestsRepository {
  static inject = injectableClass(this, TOKENS.membersRepository);

  constructor(private readonly membersRepository: MembersRepository) {
    super();
  }

  async listRequests(): Promise<shared.Request[]> {
    return Promise.all(this.all().map(this.formatRequest.bind(this)));
  }

  async getRequest(requestId: string): Promise<shared.Request | undefined> {
    const request = this.get(requestId);

    if (request) {
      return this.formatRequest(request);
    }
  }

  private async formatRequest(request: Request): Promise<shared.Request> {
    return {
      ...request,
      creationDate: request.creationDate.toISOString(),
      lastUpdateDate: request.lastUpdateDate.toISOString(),
      requester: defined(await this.membersRepository.getMember(request.requesterId)),
    };
  }
}
