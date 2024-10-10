import { DomainError } from 'src/infrastructure/domain-error';
import { DomainEvent } from 'src/infrastructure/events';
import { ForbiddenError, HttpStatus, NotFoundError } from 'src/infrastructure/http';
import { schema } from 'src/persistence';

export type Request = typeof schema.requests.$inferSelect;
export type RequestInsert = typeof schema.requests.$inferInsert;

export type RequestAnswer = typeof schema.requestAnswers.$inferSelect;

export class RequestCreatedEvent extends DomainEvent<{ requesterId: string }> {}

export class RequestEditedEvent extends DomainEvent {}

export class RequestCommentCreatedEvent extends DomainEvent<{ commentId: string; authorId: string }> {}

export class RequestFulfilledEvent extends DomainEvent {}

export class RequestCanceledEvent extends DomainEvent {}

export class RequestAnswerCreatedEvent extends DomainEvent<{
  requestAnswerId: string;
  memberId: string;
  answer: RequestAnswer['answer'];
}> {}

export class RequestAnswerChangedEvent extends DomainEvent<{
  requestAnswerId: string;
  answer: RequestAnswer['answer'] | null;
}> {}

export class RequestAnswerDeletedEvent extends DomainEvent<{ requestAnswerId: string }> {}

export class RequestNotFoundError extends NotFoundError {
  constructor() {
    super('Request not found');
  }
}

export class MemberIsNotAuthorError extends ForbiddenError {
  constructor() {
    super('Member must be the author of the request');
  }
}

export class RequestIsNotPendingError extends DomainError {
  status = HttpStatus.badRequest;

  constructor() {
    super('Request is not pending');
  }
}

export class CannotAnswerOwnRequestError extends DomainError {
  status = HttpStatus.badRequest;

  constructor() {
    super('Request is not pending');
  }
}
