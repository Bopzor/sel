import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Request = typeof schema.requests.$inferSelect;
export type RequestInsert = typeof schema.requests.$inferInsert;

export type RequestAnswer = typeof schema.requestAnswers.$inferSelect;

export class RequestCreatedEvent extends DomainEvent<{ requesterId: string }> {}

export class RequestEditedEvent extends DomainEvent {}

export class RequestFulfilledEvent extends DomainEvent {}

export class RequestCanceledEvent extends DomainEvent {}

export class RequestAnswerSetEvent extends DomainEvent<{
  respondentId: string;
  previousAnswer: RequestAnswer['answer'] | null;
  answer: RequestAnswer['answer'] | null;
}> {}
