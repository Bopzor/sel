import { Request } from '@sel/shared';
import { hasId } from '@sel/utils';

import { RequestsGateway } from './requests.gateway';

export class StubRequestsGateway implements RequestsGateway {
  requests = new Array<Request>();

  async listRequests(): Promise<Request[]> {
    return this.requests;
  }

  async getRequest(requestId: string): Promise<Request | undefined> {
    return this.requests.find(hasId(requestId));
  }
}
