import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { FakeHtmlParserAdapter } from '../../infrastructure/html-parser/fake-html-parser.adapter';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { UnitTest } from '../../unit-test';
import { RequestEdited } from '../request-events';
import { Request, createRequest } from '../request.entity';

import { EditRequest, EditRequestCommand } from './edit-request.command';

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

  command: EditRequestCommand = {
    requestId: this.request.id,
    title: '',
    body: '',
  };

  async execute() {
    await this.handler.handle(this.command);
  }

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
    test.command.title = 'new title';
    test.command.body = 'new body';
    await test.execute();

    expect(test.requestRepository.get('requestId')).toHaveProperty<Request['title']>('title', 'new title');
    expect(test.requestRepository.get('requestId')).toHaveProperty<Request['body']>('body', {
      html: 'new body',
      text: 'text content of new body',
    });
  });

  it('emits a RequestEdited domain event', async () => {
    await test.execute();

    expect(test.eventPublisher).toHaveEmitted(new RequestEdited('requestId'));
  });
});
