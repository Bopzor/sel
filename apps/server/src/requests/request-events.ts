import { DomainEvent } from '../domain-event';

export class RequestCreated extends DomainEvent {
  entity = 'request';
}

export class RequestEdited extends DomainEvent {
  entity = 'request';
}

export class RequestCommentCreated extends DomainEvent {
  entity = 'request';

  constructor(requestId: string, public readonly commentId: string) {
    super(requestId);
  }
}
