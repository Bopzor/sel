import { CreateRequestBody } from './shared/create-request-body.schema';
import { EditRequestBody } from './shared/edit-request-body.schema';

import { Request } from './index';

export class RequestsService {
  async listRequests(search?: string): Promise<Request[]> {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    const response = await fetch(`/api/requests?${searchParams}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const requests = await response.json();

    return requests;
  }

  async getRequest(requestId: string): Promise<Request> {
    const response = await fetch(`/api/requests/${requestId}`);

    if (!response.ok) {
      throw new Error('not ok');
    }

    const request = await response.json();

    return request;
  }

  async createRequest(request: CreateRequestBody) {
    await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  async editRequest(requestId: string, request: EditRequestBody) {
    await fetch(`/api/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }
}
