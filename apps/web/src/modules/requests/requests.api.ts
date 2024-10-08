import { CreateRequestTransactionBody, Request, RequestAnswer, RequestStatus } from '@sel/shared';
import { assert, createId, wait } from '@sel/utils';
import { injectableClass } from 'ditox';
import { produce } from 'immer';

import { container } from '../../infrastructure/container';
import { FetcherPort } from '../../infrastructure/fetcher';
import { StubSessionApi } from '../../session.api';
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

export class StubRequestsApi implements RequestsApi {
  requests = new Array<Request>();
  request: Request | undefined;

  async listRequests(): Promise<Request[]> {
    return this.requests;
  }

  async getRequest(): Promise<Request | undefined> {
    return this.request;
  }

  async createRequest(): Promise<string> {
    return '';
  }

  async editRequest(): Promise<void> {}

  async cancelRequest(): Promise<void> {
    assert(this.request);
    await this.wait();

    this.updateRequest((request) => {
      request.status = RequestStatus.canceled;
    });
  }

  async setAnswer(_requestId: string, value: RequestAnswer['answer'] | null): Promise<void> {
    const member = this.member;

    assert(this.request);
    assert(member);
    await this.wait();

    this.updateRequest((request) => {
      const { answers } = request;
      const answer = answers.find((answer) => answer.member.id === member.id);

      if (answer) {
        if (value === null) {
          answers.splice(answers.indexOf(answer), 1);
        } else {
          answer.answer = value;
        }
      } else if (value !== null) {
        answers.push({ id: createId(), member, answer: value });
      }
    });
  }

  async createComment(_requestId: string, body: string): Promise<void> {
    const member = this.member;

    assert(this.request);
    assert(member);
    await this.wait();

    this.updateRequest((request) => {
      request.comments.push({
        id: createId(),
        author: member,
        date: new Date().toISOString(),
        body,
      });
    });
  }

  async createTransaction(): Promise<void> {}

  private get member() {
    const sessionApi = container.resolve(TOKENS.sessionApi);

    if (sessionApi instanceof StubSessionApi) {
      return sessionApi.authenticatedMember;
    }
  }

  private updateRequest(updater: (request: Request) => void) {
    this.request = produce(this.request, updater);
  }

  private async wait() {
    return wait(1000);
  }
}
