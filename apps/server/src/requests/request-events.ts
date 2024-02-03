import { DomainEvent } from '../domain-event';

import { RequestAnswer } from './request-answer.entity';

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

export class RequestFulfilled extends RequestEvent {}

export class RequestCanceled extends RequestEvent {}

export class RequestAnswerCreated extends RequestEvent {
  constructor(
    requestId: string,
    public readonly requestAnswerId: string,
    public readonly answer: RequestAnswer['answer']
  ) {
    super(requestId);
  }
}

export class RequestAnswerChanged extends RequestEvent {
  constructor(
    requestId: string,
    public readonly requestAnswerId: string,
    public readonly answer: RequestAnswer['answer'] | null
  ) {
    super(requestId);
  }
}

export class RequestAnswerDeleted extends RequestEvent {
  constructor(requestId: string, public readonly requestAnswerId: string) {
    super(requestId);
  }
}
