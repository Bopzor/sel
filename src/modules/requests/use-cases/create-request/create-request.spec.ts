import { StubEventPublisher } from '../../../../common/stub-event-publisher';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { CreateRequestHandler, CreateRequestCommand, RequestCreatedEvent } from './create-request';

describe('CreateRequest', () => {
  let test: Test;

  beforeEach(() => {
    test = new Test();
  });

  it('creates a new request', async () => {
    const command: CreateRequestCommand = {
      id: 'id',
      title: 'title',
      description: 'description',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    const request = test.request;

    assert(request);
    expect(request.title).toEqual('title');
    expect(request.description).toEqual('description');
  });

  it('publishes a RequestCreatedEvent', async () => {
    const command: CreateRequestCommand = {
      id: 'id',
      title: 'title',
      description: 'description',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    expect(test.events).toContainEqual(new RequestCreatedEvent());
  });
});

class Test {
  private publisher = new StubEventPublisher();
  private requestRepository = new InMemoryRequestRepository();
  private createRequestHandler = new CreateRequestHandler(this.publisher, this.requestRepository);

  get events() {
    return this.publisher.events;
  }

  get request() {
    return this.requestRepository.get('id');
  }

  act(command: CreateRequestCommand) {
    return this.createRequestHandler.handle(command);
  }
}
