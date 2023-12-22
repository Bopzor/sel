import * as shared from '@sel/shared';

import { InsertRequestModel, RequestRepository, UpdateRequestModel } from './request.repository';

export class InMemoryRequestRepository implements RequestRepository {
  async query_listRequests(): Promise<shared.Request[]> {
    throw new Error('Method not implemented.');
  }

  async query_getRequest(requestId: string): Promise<shared.Request | undefined> {
    throw new Error('Method not implemented.');
  }

  async insert(model: InsertRequestModel): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async update(requestId: string, model: UpdateRequestModel): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
