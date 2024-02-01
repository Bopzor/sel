import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { UnitTest } from '../../unit-test';
import { RequestIsNotPending } from '../request-errors';
import { RequestCanceled, RequestFulfilled } from '../request-events';
import { RequestStatus, createRequest } from '../request.entity';

import { ChangeRequestStatus, ChangeRequestStatusCommand } from './change-request-status.command';

class Test extends UnitTest {
  eventsPublisher = new StubEventPublisher();
  requestRepository = new InMemoryRequestRepository();

  handler = new ChangeRequestStatus(this.eventsPublisher, this.requestRepository);

  command: ChangeRequestStatusCommand = {
    requestId: 'requestId',
    status: RequestStatus.fulfilled,
  };

  setup(): void {
    this.requestRepository.add(createRequest({ id: 'requestId' }));
  }

  async execute() {
    await this.handler.handle(this.command);
  }
}

describe('ChangeRequestStatus', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('marks a request as fulfilled', async () => {
    await test.execute();

    expect(test.requestRepository.get('requestId')).toHaveProperty('status', RequestStatus.fulfilled);
    expect(test.eventsPublisher).toHaveEmitted(new RequestFulfilled('requestId'));
  });

  it('marks a request as canceled', async () => {
    test.command.status = RequestStatus.canceled;

    await test.execute();

    expect(test.requestRepository.get('requestId')).toHaveProperty('status', RequestStatus.canceled);
    expect(test.eventsPublisher).toHaveEmitted(new RequestCanceled('requestId'));
  });

  it('fails when the request is already fulfilled or canceled', async () => {
    test.requestRepository.add(createRequest({ id: 'requestId', status: RequestStatus.fulfilled }));

    await expect(test.execute()).rejects.toThrow(RequestIsNotPending);
  });
});
