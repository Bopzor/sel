import { fakerFR as faker } from '@faker-js/faker';
import { Request, RequestAnswer, RequestStatus } from '@sel/shared';
import { assert, createId, wait } from '@sel/utils';
import { injectableClass } from 'ditox';
import { produce } from 'immer';

import { FetcherPort } from '../../fetcher';
import { container } from '../../infrastructure/container';
import { StubSessionApi } from '../../session.api';
import { TOKENS } from '../../tokens';

export interface RequestsApi {
  getRequest(requestId: string): Promise<Request | undefined>;
  cancelRequest(requestId: string): Promise<void>;
  setAnswer(requestId: string, answer: RequestAnswer['answer'] | null): Promise<void>;
  createComment(requestId: string, body: string): Promise<void>;
}

export class FetchRequestApi implements RequestsApi {
  static inject = injectableClass(this, TOKENS.fetcher);

  constructor(private readonly fetcher: FetcherPort) {}

  async getRequest(requestId: string): Promise<Request | undefined> {
    return this.fetcher.get<Request>(`/api/requests/${requestId}`).body();
  }

  async cancelRequest(requestId: string) {
    await this.fetcher.put<unknown, void>(`/api/requests/${requestId}/cancel`);
  }

  async setAnswer(requestId: string, answer: 'positive' | 'negative' | null) {
    await this.fetcher.post<{ answer: 'positive' | 'negative' | null }, void>(
      `/api/requests/${requestId}/answer`,
      { answer }
    );
  }

  async createComment(requestId: string, body: string) {
    await this.fetcher.post<{ body: string }, void>(`/api/requests/${requestId}/comment`, { body });
  }
}

export class StubRequestsApi implements RequestsApi {
  request: Request | undefined;

  async getRequest(): Promise<Request | undefined> {
    return this.request;
  }

  async cancelRequest(): Promise<void> {
    assert(this.request);
    await this.wait();

    this.updateRequest((request) => {
      request.status = RequestStatus.canceled;
    });
  }

  async setAnswer(requestId: string, value: RequestAnswer['answer'] | null): Promise<void> {
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

  async createComment(requestId: string, body: string): Promise<void> {
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

export class FakeRequestsApi extends StubRequestsApi {
  constructor() {
    super();

    this.request = {
      id: 'requestId',
      status: RequestStatus.pending,
      date: faker.date.past().toISOString(),
      requester: {
        ...fakeMember(),
        phoneNumbers: [{ number: faker.string.numeric({ length: 10 }), visible: true }],
        email: faker.internet.email(),
      },
      title: faker.word.words({ count: { min: 1, max: 10 } }),
      body: lorem(),
      answers: [
        {
          id: createId(),
          answer: 'positive',
          member: fakeMember(),
        },
        {
          id: createId(),
          answer: 'negative',
          member: fakeMember(),
        },
      ],
      comments: [
        {
          id: createId(),
          author: fakeMember(),
          date: faker.date.past().toISOString(),
          body: lorem(),
        },
      ],
    };
  }
}

const fakeMember = () => ({
  id: createId(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
});

const lorem = () => {
  return faker.lorem
    .paragraphs({ min: 1, max: 7 })
    .split('\n')
    .map((par) => `<p>${par}</p>`)
    .join('\n');
};
