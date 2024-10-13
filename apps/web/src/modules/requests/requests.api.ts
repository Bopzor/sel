import { CreateRequestTransactionBody, Request, RequestAnswer } from '@sel/shared';
import { injectableClass } from 'ditox';

import { FetcherPort } from '../../infrastructure/fetcher';
import { TOKENS } from '../../tokens';

export interface RequestsApi {
  listRequests(): Promise<Request[]>;
  getRequest(requestId: string): Promise<Request | undefined>;
  createRequest(title: string, body: string): Promise<string>;
  editRequest(requestId: string, title: string, body: string): Promise<void>;
  cancelRequest(requestId: string): Promise<void>;
  setAnswer(requestId: string, answer: RequestAnswer['answer'] | null): Promise<void>;
  createComment(requestId: string, body: string): Promise<void>;
  createTransaction(requestId: string, body: CreateRequestTransactionBody): Promise<void>;
}

export class FetchRequestApi implements RequestsApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async listRequests(): Promise<Request[]> {
    return this.fetcher.get<Request[]>('/requests').body();
  }

  async getRequest(requestId: string): Promise<Request | undefined> {
    return this.fetcher.get<Request>(`/requests/${requestId}`).body();
  }

  async createRequest(title: string, body: string): Promise<string> {
    const requestId = await this.fetcher
      .post<{ title: string; body: string }, string>('/requests', { title, body })
      .body();

    return requestId;
  }

  async editRequest(requestId: string, title: string, body: string): Promise<void> {
    await this.fetcher.put<{ title: string; body: string }, void>(`/requests/${requestId}`, {
      title,
      body,
    });
  }

  async cancelRequest(requestId: string) {
    await this.fetcher.put<unknown, void>(`/requests/${requestId}/cancel`);
  }

  async setAnswer(requestId: string, answer: 'positive' | 'negative' | null) {
    await this.fetcher.post<{ answer: 'positive' | 'negative' | null }, void>(
      `/requests/${requestId}/answer`,
      { answer },
    );
  }

  async createComment(requestId: string, body: string) {
    await this.fetcher.post<{ body: string }, void>(`/requests/${requestId}/comment`, { body });
  }

  async createTransaction(requestId: string, body: CreateRequestTransactionBody) {
    await this.fetcher.post<CreateRequestTransactionBody, void>(`/requests/${requestId}/transaction`, body);
  }
}
