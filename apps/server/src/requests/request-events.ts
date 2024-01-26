import { DomainEvent } from '../domain-event';

export class RequestEvent extends DomainEvent {
  entity = 'request';
}

export class RequestCreated extends RequestEvent {
  constructor(requestId: string, public readonly requesterId: string) {
    super(requestId);
  }
}

export class RequestEdited extends RequestEvent {}

export class RequestCommentCreated extends RequestEvent {
  constructor(requestId: string, public readonly commentId: string, public readonly authorId: string) {
    super(requestId);
  }
}
