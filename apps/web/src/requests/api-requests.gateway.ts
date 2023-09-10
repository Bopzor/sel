import { Request } from '@sel/shared';

import { FetchResult, Fetcher } from '../fetcher';

import { RequestsGateway } from './requests.gateway';

export class ApiRequestsGateway implements RequestsGateway {
  constructor(private readonly fetcher: Fetcher) {}

  async listRequests(): Promise<Request[]> {
    const { body } = await this.fetcher.get<Request[]>('/api/requests');
    return body;
  }

  async getRequest(requestId: string): Promise<Request | undefined> {
    try {
      const { body } = await this.fetcher.get<Request>(`/api/requests/${requestId}`);
      return body;
    } catch (error) {
      if (FetchResult.is(error) && error.status === 404) {
        return undefined;
      }

      throw error;
    }
  }
}
