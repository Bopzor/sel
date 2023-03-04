import { InMemoryDatabaseImpl } from '../../../../app/in-memory-database';
import { StubDateAdapter } from '../../../../common/ports/date/stub-date.adapter';
import { StubEventPublisher } from '../../../../common/stub-event-publisher';
import { Timestamp } from '../../../../common/timestamp.value-object';
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
      requesterId: 'requesterId',
      title: 'title',
      description: 'description',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    const request = test.request;

    assert(request);
    expect(request.title).toEqual('title');
    expect(request.description).toEqual('description');
    expect(request.creationDate).toEqual(test.now);
    expect(request.lastEditionDate).toEqual(test.now);
  });

  it('publishes a RequestCreatedEvent', async () => {
    const command: CreateRequestCommand = {
      id: 'id',
      requesterId: 'requesterId',
      title: 'title',
      description: 'description',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    expect(test.events).toContainEqual(new RequestCreatedEvent());
  });
});

class Test {
  public now = Timestamp.from('2023-01-01');

  private dateAdapter = new StubDateAdapter();
  private publisher = new StubEventPublisher();
  private database = new InMemoryDatabaseImpl();
  private requestRepository = new InMemoryRequestRepository(this.database);

  private createRequestHandler = new CreateRequestHandler(
    this.dateAdapter,
    this.publisher,
    this.requestRepository
  );

  constructor() {
    this.dateAdapter.setNow(this.now);
  }

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
