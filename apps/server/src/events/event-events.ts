import { EventParticipation } from '@sel/shared';

import { DomainEvent } from '../domain-event';

class EventEvent extends DomainEvent {
  entity = 'event';
}

export class EventCreated extends EventEvent {
  constructor(
    eventId: string,
    public readonly organizerId: string,
  ) {
    super(eventId);
  }
}

export class EventUpdated extends EventEvent {}

export class EventParticipationSet extends EventEvent {
  constructor(
    eventId: string,
    public readonly participation: EventParticipation,
  ) {
    super(eventId);
  }
}

export class EventParticipationDeleted extends EventEvent {}

export class EventCommentCreated extends EventEvent {
  constructor(
    eventId: string,
    public readonly commentId: string,
    public readonly authorId: string,
  ) {
    super(eventId);
  }
}
