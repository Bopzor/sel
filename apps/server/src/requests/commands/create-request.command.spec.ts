import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { FakeHtmlParserAdapter } from '../../infrastructure/html-parser/fake-html-parser.adapter';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { UnitTest } from '../../unit-test';
import { RequestCreated } from '../request-events';
import { Request, RequestStatus } from '../request.entity';

import { CreateRequest } from './create-request.command';

class Test extends UnitTest {
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  htmlParser = new FakeHtmlParserAdapter();
  requestRepository = new InMemoryRequestRepository();

  handler = new CreateRequest(this.dateAdapter, this.eventPublisher, this.htmlParser, this.requestRepository);

  setup() {
    this.dateAdapter.date = createDate('2023-01-01');
  }
}

describe('[Unit] CreateRequest', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('creates a new request', async () => {
    await test.handler.handle('requestId', 'requesterId', 'title', 'body');

    expect(test.requestRepository.get('requestId')).toEqual<Request>({
      id: 'requestId',
      requesterId: 'requesterId',
      status: RequestStatus.pending,
      date: test.dateAdapter.now(),
      title: 'title',
      body: {
        html: 'body',
        text: 'text content of body',
      },
    });
  });

  it('emits a RequestCreated domain event', async () => {
    await test.handler.handle('requestId', 'requesterId', 'title', 'body');

    expect(test.eventPublisher).toHaveEmitted(new RequestCreated('requestId'));
  });
});
