import { Request } from '@sel/shared';

export interface RequestsGateway {
  listRequests(): Promise<Request[]>;
  getRequest(requestId: string): Promise<Request | undefined>;
}
