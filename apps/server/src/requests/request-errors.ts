import { DomainError, EntityNotFound } from '../domain-error';
import { HttpStatus } from '../http-status';

import { RequestStatus } from './request.entity';

export class RequestNotFound extends EntityNotFound {
  constructor(requestId: string) {
    super('Request not found', 'request', requestId);
  }
}

export class MemberIsNotAuthor extends DomainError<{ requestId: string; memberId: string }> {
  status = HttpStatus.forbidden;

  constructor(requestId: string, memberId: string) {
    super('Member must be the author of the request', { requestId, memberId });
  }
}

export class RequestIsNotPending extends DomainError<{ requestId: string; status: RequestStatus }> {
  status = HttpStatus.badRequest;

  constructor(requestId: string, status: RequestStatus) {
    super('Request is not pending', { requestId, status });
  }
}

export class CannotAnswerOwnRequest extends DomainError<{ requestId: string }> {
  status = HttpStatus.badRequest;

  constructor(requestId: string) {
    super('Request is not pending', { requestId });
  }
}
