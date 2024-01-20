import * as shared from '@sel/shared';
import { defined } from '@sel/utils';

import { InMemoryRepository } from '../in-memory.repository';

import { Request, RequestStatus } from './request.entity';
import { InsertRequestModel, RequestRepository, UpdateRequestModel } from './request.repository';

export class InMemoryRequestRepository extends InMemoryRepository<Request> implements RequestRepository {
  async query_listRequests(): Promise<shared.Request[]> {
    throw new Error('Method not implemented.');
  }

  async query_getRequest(): Promise<shared.Request | undefined> {
    throw new Error('Method not implemented.');
  }

  async getRequest(requestId: string): Promise<Request | undefined> {
    return this.get(requestId);
  }

  async insert(model: InsertRequestModel): Promise<void> {
    this.add({
      status: RequestStatus.pending,
      ...model,
    });
  }

  async update(requestId: string, model: UpdateRequestModel): Promise<void> {
    this.set(requestId, {
      ...defined(this.get(requestId)),
      ...model,
    });
  }
}
