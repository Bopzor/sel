import { transformMember } from '../members';
import { Member } from '../members/entities/member.entity';

import { Request } from './entities/request.entity';
import { GetRequestResult } from './use-cases/get-request/get-request-result';

export type { GetRequestResult as Request } from './use-cases/get-request/get-request-result';

export const transformRequest = (request: Request, requester: Member): GetRequestResult => ({
  id: request.id,
  requester: transformMember(requester),
  title: request.title,
  description: request.description,
  creationDate: request.creationDate.toString(),
  lastEditionDate: request.lastEditionDate.toString(),
});
