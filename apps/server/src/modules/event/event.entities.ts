import * as shared from '@sel/shared';

import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Event = typeof schema.events.$inferSelect;
export type EventInsert = typeof schema.events.$inferInsert;

export type EventParticipation = typeof schema.eventParticipations.$inferSelect;

export class EventCreatedEvent extends DomainEvent<{
  organizerId: string;
}> {}

export class EventUpdatedEvent extends DomainEvent {}

export class EventParticipationSetEvent extends DomainEvent<{
  participantId: string;
  previousParticipation: shared.EventParticipation | null;
  participation: shared.EventParticipation | null;
}> {}

export class EventCommentCreatedEvent extends DomainEvent<{
  commentId: string;
  authorId: string;
}> {}
