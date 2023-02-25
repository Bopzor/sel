import { EntityNotFoundError } from '../../../../common/entity-not-found.error';
import { StubEventPublisher } from '../../../../common/stub-event-publisher';
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

  it('publishes a RequestEditedEvent', async () => {
    const command: EditRequestCommand = {
      id: 'id',
      title: 'edited',
    };

    await expect(test.act(command)).resolves.toBeUndefined();

    expect(test.events).toContainEqual(new RequestEditedEvent());
  });

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
  private publisher = new StubEventPublisher();
  private requestRepository = new InMemoryRequestRepository();
  private editRequestHandler = new EditRequestHandler(this.publisher, this.requestRepository);

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
    this.requestRepository.add(create.request({ id: 'id', title: 'title', description: 'description' }));
  }

  act(command: EditRequestCommand) {
    return this.editRequestHandler.handle(command);
  }
}
