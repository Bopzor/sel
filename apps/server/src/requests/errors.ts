import { DomainError, EntityNotFound } from '../domain-error';
import { HttpStatus } from '../http-status';

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
