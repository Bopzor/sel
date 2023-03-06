import { Container } from 'brandi';
import { ContainerProvider as BrandiContainerProvider } from 'brandi-react';

import { RealDateAdapter } from '../common/ports/date/real-date.adapter';
import { StubEventPublisher } from '../common/stub-event-publisher';
import { InMemoryMemberRepository } from '../modules/members/in-memory-member.repository';
import { GetMemberHandler } from '../modules/members/use-cases/get-member/get-member';
import { InMemoryRequestRepository } from '../modules/requests/in-memory-request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';
import { TOKENS } from '../tokens';

import { InMemoryDatabase } from './in-memory-database';

export const container = new Container();

container.bind(TOKENS.dateAdapter).toInstance(RealDateAdapter).inSingletonScope();
container.bind(TOKENS.publisher).toInstance(StubEventPublisher).inSingletonScope();
container.bind(TOKENS.inMemoryDatabase).toInstance(InMemoryDatabase).inSingletonScope();
container.bind(TOKENS.requestRepository).toInstance(InMemoryRequestRepository).inSingletonScope();
container.bind(TOKENS.memberRepository).toInstance(InMemoryMemberRepository).inSingletonScope();
container.bind(TOKENS.getRequestHandler).toInstance(GetRequestHandler).inSingletonScope();
container.bind(TOKENS.listRequestsHandler).toInstance(ListRequestsHandler).inSingletonScope();
container.bind(TOKENS.createRequestHandler).toInstance(CreateRequestHandler).inSingletonScope();
container.bind(TOKENS.editRequestHandler).toInstance(EditRequestHandler).inSingletonScope();
container.bind(TOKENS.getMemberHandler).toInstance(GetMemberHandler).inSingletonScope();

type ContainerProviderProps = {
  children: React.ReactNode;
};

export const ContainerProvider = ({ children }: ContainerProviderProps) => (
  <BrandiContainerProvider container={container}>{children}</BrandiContainerProvider>
);
