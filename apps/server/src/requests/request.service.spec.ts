import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventsAdapter } from '../infrastructure/events/stub-events.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { FakeHtmlParserAdapter } from '../infrastructure/html-parser/fake-html-parser.adapter';
import { StubSubscriptionFacade } from '../notifications/subscription.facade';
import { UnitTest } from '../unit-test';

import { RequestCreated, RequestEdited } from './events';
import { InMemoryRequestRepository } from './in-memory-request.repository';
import { Request, RequestStatus, createRequest } from './request.entity';
import { RequestService } from './request.service';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  events = new StubEventsAdapter();
  htmlParser = new FakeHtmlParserAdapter();
  subscriptionFacade = new StubSubscriptionFacade();
  requestRepository = new InMemoryRequestRepository();

  service = new RequestService(
    this.generator,
    this.dateAdapter,
    this.events,
    this.htmlParser,
    this.subscriptionFacade,
    this.requestRepository
  );

  setup() {
    this.generator.nextId = 'requestId';
    this.dateAdapter.date = createDate('2023-01-01');
  }
}

describe('RequestService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('createRequest', () => {
    it('creates a new request', async () => {
      expect(await test.service.createRequest('requesterId', 'title', 'body')).toEqual('requestId');

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
      await test.service.createRequest('requesterId', 'title', 'body');

      expect(test.events).toHaveEmitted(new RequestCreated('requestId'));
    });
  });

  describe('editRequest', () => {
    let request: Request;

    beforeEach(() => {
      request = test.requestRepository.add(
        createRequest({
          id: 'requestId',
          requesterId: 'requesterId',
          title: 'title',
          body: { html: 'html', text: 'text' },
        })
      );
    });

    it('edits an existing request', async () => {
      await test.service.editRequest(request, 'new title', 'new body');

      expect(test.requestRepository.get('requestId')).toHaveProperty<Request['title']>('title', 'new title');
      expect(test.requestRepository.get('requestId')).toHaveProperty<Request['body']>('body', {
        html: 'new body',
        text: 'text content of new body',
      });
    });

    it('emits a RequestEdited domain event', async () => {
      await test.service.editRequest(request, '', '');

      expect(test.events).toHaveEmitted(new RequestEdited('requestId'));
    });
  });
});
