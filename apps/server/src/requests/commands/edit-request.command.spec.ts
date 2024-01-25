import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { FakeHtmlParserAdapter } from '../../infrastructure/html-parser/fake-html-parser.adapter';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { UnitTest } from '../../unit-test';
import { RequestEdited } from '../request-events';
import { Request, createRequest } from '../request.entity';

import { EditRequest } from './edit-request.command';

class Test extends UnitTest {
  eventPublisher = new StubEventPublisher();
  htmlParser = new FakeHtmlParserAdapter();
  requestRepository = new InMemoryRequestRepository();

  handler = new EditRequest(this.eventPublisher, this.htmlParser, this.requestRepository);

  request = createRequest({
    id: 'requestId',
    requesterId: 'requesterId',
    title: 'title',
    body: { html: 'html', text: 'text' },
  });

  setup() {
    this.requestRepository.add(this.request);
  }
}

describe('[Unit] EditRequest', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('edits an existing request', async () => {
    await test.handler.handle(test.request.id, 'new title', 'new body');

    expect(test.requestRepository.get('requestId')).toHaveProperty<Request['title']>('title', 'new title');
    expect(test.requestRepository.get('requestId')).toHaveProperty<Request['body']>('body', {
      html: 'new body',
      text: 'text content of new body',
    });
  });

  it('emits a RequestEdited domain event', async () => {
    await test.handler.handle(test.request.id, '', '');

    expect(test.eventPublisher).toHaveEmitted(new RequestEdited('requestId'));
  });
});
