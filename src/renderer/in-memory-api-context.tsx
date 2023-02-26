import { ApiContext, ClassType, CommandBus, QueryBus } from '../app/api.context';
import { assert } from '../common/assert';
import { CommandHandler } from '../common/cqs/command-handler';
import { QueryHandler } from '../common/cqs/query-handler';
import { RealDateAdapter } from '../common/ports/date/real-date.adapter';
import { StubEventPublisher } from '../common/stub-event-publisher';
import { Timestamp } from '../common/timestamp.value-object';
import { create } from '../modules/requests/factories';
import { InMemoryRequestRepository } from '../modules/requests/in-memory-request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';

class InMemoryQueryBus implements QueryBus {
  constructor(private repository: InMemoryRequestRepository) {}

  private handlers = new Map<ClassType<QueryHandler<object, unknown>>, QueryHandler<object, unknown>>([
    [GetRequestHandler, new GetRequestHandler(this.repository)],
    [ListRequestsHandler, new ListRequestsHandler(this.repository)],
  ]);

  execute<Query extends object, Result>(
    Handler: ClassType<QueryHandler<Query, Result>>,
    query: Query
  ): Result {
    const handler = this.handlers.get(Handler);

    assert(handler);

    return handler.handle(query) as Result;
  }
}

class InMemoryCommandBus implements CommandBus {
  private dateAdapter = new RealDateAdapter();
  private publisher = new StubEventPublisher();

  private handlers = new Map<ClassType<CommandHandler<object>>, CommandHandler<object>>([
    [CreateRequestHandler, new CreateRequestHandler(this.dateAdapter, this.publisher, this.repository)],
    [EditRequestHandler, new EditRequestHandler(this.dateAdapter, this.publisher, this.repository)],
  ]);

  constructor(private repository: InMemoryRequestRepository) {}

  async execute<Command extends object>(
    Handler: ClassType<CommandHandler<Command>>,
    command: Command
  ): Promise<void> {
    const handler = this.handlers.get(Handler);

    assert(handler);

    await handler.handle(command);
  }
}

const repository = new InMemoryRequestRepository();

repository.add(
  create.request({
    id: 'id1',
    title: 'Hello world!',
    description: 'First request.',
    creationDate: Timestamp.from('2022-01-01T12:42'),
    lastEditionDate: Timestamp.from('2022-01-01T12:42'),
  })
);

  })
);

export const apiContext: ApiContext = {
  queryBus: new InMemoryQueryBus(repository),
  commandBus: new InMemoryCommandBus(repository),
};
