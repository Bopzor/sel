import { ApiContext, ClassType, CommandBus, QueryBus } from '../app/api.context';
import { container } from '../app/container';
import { assert } from '../common/assert';
import { CommandHandler } from '../common/cqs/command-handler';
import { QueryHandler } from '../common/cqs/query-handler';
import { Timestamp } from '../common/timestamp.value-object';
import { create as memberFactories } from '../modules/members/factories';
import { InMemoryMemberRepository } from '../modules/members/in-memory-member.repository';
import { GetMemberHandler } from '../modules/members/use-cases/get-member/get-member';
import { create as requestFactories } from '../modules/requests/factories';
import { InMemoryRequestRepository } from '../modules/requests/in-memory-request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';
import { TOKENS } from '../tokens';

type Handler = CommandHandler<object> | QueryHandler<object, unknown>;

class InMemoryBus implements QueryBus, CommandBus {
  private handlers = new Map<ClassType<Handler>, Handler>([
    [GetRequestHandler, container.get(TOKENS.getRequestHandler)],
    [ListRequestsHandler, container.get(TOKENS.listRequestsHandler)],
    [CreateRequestHandler, container.get(TOKENS.createRequestHandler)],
    [EditRequestHandler, container.get(TOKENS.editRequestHandler)],

    [GetMemberHandler, container.get(TOKENS.getMemberHandler)],
  ]);

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

const requestRepository = container.get(TOKENS.requestRepository) as InMemoryRequestRepository;
const memberRepository = container.get(TOKENS.memberRepository) as InMemoryMemberRepository;

memberRepository.add(
  memberFactories.member({
    id: 'nils',
    email: 'nils@nilscox.dev',
    firstName: 'nils',
    lastName: 'cox',
  })
);

const bus = new InMemoryBus();

requestRepository.add(
  requestFactories.request({
    id: 'id2',
    requesterId: 'nils',
    title: 'Garde de chats pendant noël',
    description:
      "Bonjour ! Je cherche quelqu'un qui pourrait passer nourrir et câliner mes chats du 23 au 26 décembre Eat plants, meow, and throw up because i ate plants. Kitty attack like a vicious monster. Cat dog hate mouse eat string barf pillow no baths hate everything stare out cat door then go back inside for damn that dog yet ask for petting stare at ceiling.",
    creationDate: Timestamp.from('2022-02-26T19:22'),
    lastEditionDate: Timestamp.from('2022-02-26T19:35'),
  })
);

requestRepository.add(
  requestFactories.request({
    id: 'id3',
    requesterId: 'nils',
    title: 'Jeu du Loup Garou',
    description:
      "Bonjour. J'organise l'anniversaire de mon fils ce samedi, j'aimerais avoir le jeu du loup garou. Est ce que quelqu'un pourrait me le prêter ? Merci",
    creationDate: Timestamp.from('2022-04-02T14:00'),
    lastEditionDate: Timestamp.from('2022-04-02T14:00'),
  })
);

export const apiContext: ApiContext = {
  queryBus: bus,
  commandBus: bus,
};
