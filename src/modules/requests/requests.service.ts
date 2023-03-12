import { injected } from 'brandi';

import { FRONT_TOKENS } from '../../app/front-tokens';
import { HttpClient } from '../../app/http-client';

import { CreateRequestBody } from './shared/create-request-body.schema';
import { EditRequestBody } from './shared/edit-request-body.schema';

import { Request } from './index';

export class RequestsService {
  constructor(private readonly http: HttpClient) {}

  async listRequests(search?: string): Promise<Request[]> {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    const response = await this.http.get(`/api/requests?${searchParams}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const requests = await response.json();

    return requests;
  }

  async getRequest(requestId: string): Promise<Request> {
    const response = await this.http.get(`/api/requests/${requestId}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const request = await response.json();

    return request;
  }

  async createRequest(request: CreateRequestBody) {
    await this.http.post('/api/requests', request);
  }

  async editRequest(requestId: string, request: EditRequestBody) {
    await this.http.put(`/api/requests/${requestId}`, request);
  }
}

injected(RequestsService, FRONT_TOKENS.httpClient);
