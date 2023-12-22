import { createDate } from '@sel/utils';
import { describe, beforeEach, it, expect } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { FakeHtmlParserAdapter } from '../infrastructure/html-parser/fake-html-parser.adapter';
import { UnitTest } from '../unit-test';

import { InMemoryRequestRepository } from './in-memory-request.repository';
import { Request, RequestStatus } from './request.entity';
import { RequestService } from './request.service';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  htmlParser = new FakeHtmlParserAdapter();
  requestRepository = new InMemoryRequestRepository();

  service = new RequestService(this.generator, this.dateAdapter, this.htmlParser, this.requestRepository);

  setup() {
    this.generator.idValue = 'requestId';
    this.dateAdapter.date = createDate('2023-01-01');
  }
}

describe('RequestService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

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
});
