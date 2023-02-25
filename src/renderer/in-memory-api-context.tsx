import { ApiContext, ClassType, CommandBus, QueryBus } from '../app/api.context';
import { assert } from '../common/assert';
import { CommandHandler } from '../common/cqs/command-handler';
import { QueryHandler } from '../common/cqs/query-handler';
import { StubEventPublisher } from '../common/stub-event-publisher';
import { create } from '../modules/requests/factories';
import { InMemoryRequestRepository } from '../modules/requests/in-memory-request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';

class InMemoryQueryBus implements QueryBus {
  private repository = new InMemoryRequestRepository();

  constructor() {
    this.repository.add(
      create.request({
        id: 'id',
        title: 'Hello world!',
      })
    );
  }

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
  private publisher = new StubEventPublisher();
  private repository = new InMemoryRequestRepository();

  private handlers = new Map<ClassType<CommandHandler<object>>, CommandHandler<object>>([
    [CreateRequestHandler, new CreateRequestHandler(this.publisher, this.repository)],
    [EditRequestHandler, new EditRequestHandler(this.publisher, this.repository)],
  ]);

  async execute<Command extends object>(
    Handler: ClassType<CommandHandler<Command>>,
    command: Command
  ): Promise<void> {
    const handler = this.handlers.get(Handler);

    assert(handler);

    await handler.handle(command);
  }
}

export const apiContext: ApiContext = {
  queryBus: new InMemoryQueryBus(),
  commandBus: new InMemoryCommandBus(),
};
