import { Container } from 'brandi';

import { InMemoryDatabase } from '../app/in-memory-database';
import { RealDateAdapter } from '../common/ports/date/real-date.adapter';
import { StubEventPublisher } from '../common/stub-event-publisher';
import { SqlMemberRepository } from '../modules/members/api/repositories/sql-member.repository';
import { GetMemberHandler } from '../modules/members/use-cases/get-member/get-member';
import { ListMembersHandler } from '../modules/members/use-cases/list-members/list-members';
import { SqlRequestRepository } from '../modules/requests/api/repositories/sql-request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';

import { TOKENS } from './tokens';

export const container = new Container();

container.bind(TOKENS.dateAdapter).toInstance(RealDateAdapter).inSingletonScope();
container.bind(TOKENS.publisher).toInstance(StubEventPublisher).inSingletonScope();
container.bind(TOKENS.inMemoryDatabase).toInstance(InMemoryDatabase).inSingletonScope();
container.bind(TOKENS.requestRepository).toInstance(SqlRequestRepository).inSingletonScope();
container.bind(TOKENS.memberRepository).toInstance(SqlMemberRepository).inSingletonScope();
container.bind(TOKENS.getRequestHandler).toInstance(GetRequestHandler).inSingletonScope();
container.bind(TOKENS.listRequestsHandler).toInstance(ListRequestsHandler).inSingletonScope();
container.bind(TOKENS.createRequestHandler).toInstance(CreateRequestHandler).inSingletonScope();
container.bind(TOKENS.editRequestHandler).toInstance(EditRequestHandler).inSingletonScope();
container.bind(TOKENS.listMembersHandler).toInstance(ListMembersHandler).inSingletonScope();
container.bind(TOKENS.getMemberHandler).toInstance(GetMemberHandler).inSingletonScope();
