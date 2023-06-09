import { token } from 'brandi';

import { EventPublisher } from '../common/cqs/event-publisher';
import { InMemoryDatabaseInterface } from '../common/in-memory-repository';
import { DatePort } from '../common/ports/date/date.port';
import { MemberRepository } from '../modules/members/api/member.repository';
import { GetMemberHandler } from '../modules/members/use-cases/get-member/get-member';
import { ListMembersHandler } from '../modules/members/use-cases/list-members/list-members';
import { RequestRepository } from '../modules/requests/api/repositories/request.repository';
import { CreateRequestHandler } from '../modules/requests/use-cases/create-request/create-request';
import { EditRequestHandler } from '../modules/requests/use-cases/edit-request/edit-request';
import { GetRequestHandler } from '../modules/requests/use-cases/get-request/get-request';
import { ListRequestsHandler } from '../modules/requests/use-cases/list-requests/list-requests';

import { OrmType } from './persistence/types';

export const TOKENS = {
  dateAdapter: token<DatePort>('dateAdapter'),
  publisher: token<EventPublisher>('publisher'),
  inMemoryDatabase: token<InMemoryDatabaseInterface>('inMemoryDatabase'),
  orm: token<OrmType>('orm'),
  requestRepository: token<RequestRepository>('requestRepository'),
  memberRepository: token<MemberRepository>('memberRepository'),
  getRequestHandler: token<GetRequestHandler>('getRequestHandler'),
  listRequestsHandler: token<ListRequestsHandler>('listRequestsHandler'),
  createRequestHandler: token<CreateRequestHandler>('createRequestHandler'),
  editRequestHandler: token<EditRequestHandler>('editRequestHandler'),
  listMembersHandler: token<ListMembersHandler>('listMembersHandler'),
  getMemberHandler: token<GetMemberHandler>('getMemberHandler'),
};
