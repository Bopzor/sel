import { InMemoryDatabase } from '../../../../app/in-memory-database';
import { EntityNotFoundError } from '../../../../common/entity-not-found.error';
import { StubDateAdapter } from '../../../../common/ports/date/stub-date.adapter';
import { StubEventPublisher } from '../../../../common/stub-event-publisher';
import { Timestamp } from '../../../../common/timestamp.value-object';
import { create } from '../../factories';
import { InMemoryRequestRepository } from '../../in-memory-request.repository';

import { EditRequestCommand, EditRequestHandler, NoEditedField, RequestEditedEvent } from './edit-request';

describe('EditRequest', () => {
  let test: Test;

  beforeEach(() => {
    test = new Test();
  });

  it("edits an existing request's title", async () => {
    const command: EditRequestCommand = {
      id: 'id',
      title: 'edited',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    const request = test.request;

    assert(request);
    expect(request.title).toEqual('edited');
    expect(request.description).toEqual('description');
  });

  it("updates the request's date", async () => {
    const command: EditRequestCommand = {
      id: 'id',
      title: 'edited',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    expect(test.request).toHaveProperty('lastEditionDate', test.now);
  });

  it('publishes a RequestEditedEvent', async () => {
    const command: EditRequestCommand = {
      id: 'id',
      title: 'edited',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    expect(test.events).toContainEqual(new RequestEditedEvent());
  });

  it.todo("fails when editing someone else's request");

  it('fails when the request does not exist', async () => {
    const command: EditRequestCommand = {
      id: 'other-id',
    };

    await expect(test.act(command)).rejects.test((error) => {
      assert(error instanceof EntityNotFoundError);
      expect(error.entityName).toEqual('Request');
      expect(error.where).toEqual({ id: 'other-id' });
    });
  });

  it('fails when no field to edit was given', async () => {
    const command: EditRequestCommand = {
      id: 'id',
    };

    await expect(test.act(command)).rejects.test((error) => {
      assert(error instanceof NoEditedField);
    });
  });

  it('fails when no field has changed', async () => {
    const command: EditRequestCommand = {
      id: 'id',
      title: 'title',
    };

    await expect(test.act(command)).rejects.test((error) => {
      assert(error instanceof NoEditedField);
    });
  });
});

class Test {
  public now = Timestamp.from('2022-01-02');

  private dateAdapter = new StubDateAdapter();
  private publisher = new StubEventPublisher();
  private database = new InMemoryDatabase();
  private requestRepository = new InMemoryRequestRepository(this.database);

  private editRequestHandler = new EditRequestHandler(
    this.dateAdapter,
    this.publisher,
    this.requestRepository
  );

  get events() {
    return this.publisher.events;
  }

  get request() {
    return this.requestRepository.get('id');
  }

  constructor() {
    this.arrange();
  }

  arrange() {
    this.dateAdapter.setNow(this.now);
    this.requestRepository.add(
      create.request({
        id: 'id',
        title: 'title',
        description: 'description',
        creationDate: Timestamp.from('2022-01-01'),
        lastEditionDate: Timestamp.from('2022-01-01'),
      })
    );
  }

  act(command: EditRequestCommand) {
    return this.editRequestHandler.handle(command);
  }
}
