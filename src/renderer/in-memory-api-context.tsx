import { ApiContext, ClassType, CommandBus, QueryBus } from '../app/api.context';
import { InMemoryDatabaseImpl } from '../app/in-memory-database';
import { assert } from '../common/assert';
import { CommandHandler } from '../common/cqs/command-handler';
import { QueryHandler } from '../common/cqs/query-handler';
import { RealDateAdapter } from '../common/ports/date/real-date.adapter';
import { StubEventPublisher } from '../common/stub-event-publisher';
import { Timestamp } from '../common/timestamp.value-object';
import { create as memberFactories } from '../modules/members/factories';
import { InMemoryMemberRepository } from '../modules/members/in-memory-member.repository';
import { create as requestFactories } from '../modules/requests/factories';
import { InMemoryRequestRepository } from '../modules/requests/in-memory-request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';

type Handler = CommandHandler<object> | QueryHandler<object, unknown>;

class InMemoryBus implements QueryBus, CommandBus {
  private dateAdapter = new RealDateAdapter();
  private publisher = new StubEventPublisher();

  private handlers = new Map<ClassType<Handler>, Handler>([
    [GetRequestHandler, new GetRequestHandler(this.repository)],
    [ListRequestsHandler, new ListRequestsHandler(this.repository)],
    [CreateRequestHandler, new CreateRequestHandler(this.dateAdapter, this.publisher, this.repository)],
    [EditRequestHandler, new EditRequestHandler(this.dateAdapter, this.publisher, this.repository)],
  ]);

  constructor(private repository: InMemoryRequestRepository) {}

  async execute<Command extends object>(
    Handler: ClassType<CommandHandler<Command>>,
    param: Command
  ): Promise<void>;

  async execute<Query extends object, Result>(
    Handler: ClassType<QueryHandler<Query, Result>>,
    param: Query
  ): Promise<Result>;

  async execute(Handler: ClassType<Handler>, param: object): Promise<unknown> {
    const handler = this.handlers.get(Handler);

    assert(handler);

    await new Promise((r) => setTimeout(r, 1000));

    return handler.handle(param);
  }
}

const database = new InMemoryDatabaseImpl();

const requestRepository = new InMemoryRequestRepository(database);
const memberRepository = new InMemoryMemberRepository(database);

memberRepository.add(
  memberFactories.member({
    id: 'nils',
    email: 'nils@nilscox.dev',
    firstName: 'nils',
    lastName: 'cox',
  })
);

requestRepository.add(
  requestFactories.request({
    id: 'id1',
    requesterId: 'nils',
    title: 'Hello world!',
    description: 'First request.',
    creationDate: Timestamp.from('2022-01-01T12:42'),
    lastEditionDate: Timestamp.from('2022-01-01T12:42'),
  })
);

const bus = new InMemoryBus(requestRepository);

export const apiContext: ApiContext = {
  queryBus: bus,
  commandBus: bus,
};
