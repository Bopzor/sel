import { DomainError } from '../domain-error';
import { HttpStatus } from '../http-status';

export class InterestAlreadyAdded extends DomainError<{ interestId: string }> {
  status = HttpStatus.badRequest;

  constructor(interestId: string) {
    super(`Interest was already added`, { interestId });
  }
}

export class InterestNotAdded extends DomainError<{ interestId: string }> {
  status = HttpStatus.badRequest;

  constructor(interestId: string) {
    super(`Interest was not added`, { interestId });
  }
}
