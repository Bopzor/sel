import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../../infrastructure/generator/stub-generator.adapter';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { InMemoryRequestAnswerRepository } from '../../persistence/repositories/request-answer/in-memory-request-answer.repository';
import { UnitTest } from '../../unit-test';
import { RequestAnswer, createRequestAnswer } from '../request-answer.entity';
import { CannotAnswerOwnRequest, RequestIsNotPending } from '../request-errors';
import { RequestAnswerChanged, RequestAnswerCreated, RequestAnswerDeleted } from '../request-events';
import { RequestStatus, createRequest } from '../request.entity';

import { SetRequestAnswer, SetRequestAnswerCommand } from './set-request-answer.command';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  requestRepository = new InMemoryRequestRepository();
  requestAnswerRepository = new InMemoryRequestAnswerRepository();

  handler = new SetRequestAnswer(
    this.generator,
    this.dateAdapter,
    this.eventPublisher,
    this.requestRepository,
    this.requestAnswerRepository
  );

  request = createRequest({
    id: 'requestId',
    requesterId: 'requesterId',
  });

  command: SetRequestAnswerCommand = {
    requestId: this.request.id,
    memberId: 'memberId',
    answer: null,
  };

  setup() {
    this.dateAdapter.date = createDate('2024-01-01');
    this.requestRepository.add(this.request);
  }

  async execute() {
    await this.handler.handle(this.command);
  }
}

describe('[Unit] SetRequestAnswer', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('create request answer', () => {
    beforeEach(() => {
      test.generator.nextId = 'generatedId';
      test.command.answer = 'positive';
    });

    it('creates a new answer to a request', async () => {
      await test.execute();

      expect(test.requestAnswerRepository.get('generatedId')).toEqual<RequestAnswer>({
        id: 'generatedId',
        requestId: 'requestId',
        memberId: 'memberId',
        answer: 'positive',
        date: test.dateAdapter.now(),
      });
    });

    it('emits a domain event when a request answer has been created', async () => {
      await test.execute();

      expect(test.eventPublisher).toHaveEmitted(
        new RequestAnswerCreated('requestId', 'generatedId', 'memberId', 'positive')
      );
    });

    it('does not create a null answer', async () => {
      test.command.answer = null;

      await test.execute();

      expect(test.requestAnswerRepository.all()).toHaveLength(0);
    });

    it('prevents the requester to create an answer on their own request', async () => {
      test.command.memberId = 'requesterId';

      await expect(test.execute()).rejects.toThrow(CannotAnswerOwnRequest);
    });

    it('prevents to set an answer on a request that is not pending', async () => {
      test.requestRepository.add(
        createRequest({
          id: 'requestId',
          status: RequestStatus.canceled,
        })
      );

      await expect(test.execute()).rejects.toThrow(RequestIsNotPending);
    });
  });

  describe('change request answer', () => {
    beforeEach(() => {
      test.requestAnswerRepository.add(
        createRequestAnswer({
          id: 'requestAnswerId',
          requestId: 'requestId',
          memberId: 'memberId',
          answer: 'positive',
          date: createDate('2023-01-01'),
        })
      );

      test.command.answer = 'negative';
    });

    it('changes an answer to a request', async () => {
      await test.execute();

      expect(test.requestAnswerRepository.get('requestAnswerId')).toEqual<RequestAnswer>({
        id: 'requestAnswerId',
        requestId: 'requestId',
        memberId: 'memberId',
        answer: 'negative',
        date: test.dateAdapter.now(),
      });
    });

    it('emits a domain event when a request answer has been changed', async () => {
      await test.execute();

      expect(test.eventPublisher).toHaveEmitted(
        new RequestAnswerChanged('requestId', 'requestAnswerId', 'negative')
      );
    });

    it('prevents to set the same answer', async () => {
      test.command.answer = 'positive';

      await test.execute();

      expect(test.eventPublisher.events).toHaveLength(0);
    });
  });

  describe('delete request answer', () => {
    beforeEach(() => {
      test.requestAnswerRepository.add(
        createRequestAnswer({
          id: 'requestAnswerId',
          requestId: 'requestId',
          memberId: 'memberId',
          answer: 'positive',
          date: createDate('2023-01-01'),
        })
      );

      test.command.answer = null;
    });

    it('deletes a request answer', async () => {
      await test.execute();

      expect(test.requestAnswerRepository.all()).toHaveLength(0);
    });

    it('emits a domain event when a request answer has been deleted', async () => {
      await test.execute();

      expect(test.eventPublisher).toHaveEmitted(new RequestAnswerDeleted('requestId', 'requestAnswerId'));
    });
  });
});
