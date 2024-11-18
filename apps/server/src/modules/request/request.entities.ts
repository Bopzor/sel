import { DomainEvent } from 'src/infrastructure/events';
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

export class RequestAnswerDeletedEvent extends DomainEvent<{
  requestAnswerId: string;
}> {}
