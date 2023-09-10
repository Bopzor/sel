import * as shared from '@sel/shared';

export interface RequestsRepository {
  listRequests(): Promise<shared.Request[]>;
  getRequest(requesterId: string): Promise<shared.Request | undefined>;
}
