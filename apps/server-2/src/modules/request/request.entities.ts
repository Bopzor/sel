import { DomainError } from 'src/infrastructure/domain-error';
import { DomainEvent } from 'src/infrastructure/events';
import { ForbiddenError, HttpStatus, NotFoundError } from 'src/infrastructure/http';
import { schema } from 'src/persistence';

export type Request = typeof schema.requests.$inferSelect;
export type RequestAnswer = typeof schema.requestAnswers.$inferSelect;

class RequestEvent extends DomainEvent {
  public entity = 'request';
}

export class RequestCreatedEvent extends RequestEvent {
  constructor(
    requestId: string,
    public requesterId: string,
  ) {
    super(requestId);
  }
}

export class RequestEditedEvent extends RequestEvent {}

export class RequestCommentCreatedEvent extends RequestEvent {
  constructor(
    requestId: string,
    public readonly commentId: string,
    public readonly authorId: string,
  ) {
    super(requestId);
  }
}

export class RequestFulfilledEvent extends RequestEvent {}

export class RequestCanceledEvent extends RequestEvent {}

export class RequestAnswerCreatedEvent extends RequestEvent {
  constructor(
    requestId: string,
    public readonly requestAnswerId: string,
    public readonly memberId: string,
    public readonly answer: RequestAnswer['answer'],
  ) {
    super(requestId);
  }
}

export class RequestAnswerChangedEvent extends RequestEvent {
  constructor(
    requestId: string,
    public readonly requestAnswerId: string,
    public readonly answer: RequestAnswer['answer'] | null,
  ) {
    super(requestId);
  }
}

export class RequestAnswerDeletedEvent extends RequestEvent {
  constructor(
    requestId: string,
    public readonly requestAnswerId: string,
  ) {
    super(requestId);
  }
}

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
