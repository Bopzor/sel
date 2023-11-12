import { ClassType } from '@sel/utils';

import { DomainEvent } from '../../domain-event';

export interface EventListener<Event extends DomainEvent> {
  (event: Event): void | Promise<void>;
}

export interface EventsPort {
  addEventListener<Event extends DomainEvent>(
    EventClass: ClassType<Event>,
    listener: EventListener<Event>
  ): void;

  emit(event: DomainEvent): void;
}
