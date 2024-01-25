import { ClassType } from '@sel/utils';

import { DomainEvent } from '../../domain-event';

export interface EventListener<Event extends DomainEvent = DomainEvent> {
  (event: Event): void | Promise<void>;
}

/** @deprecated use EventBus */
export interface EventsPort {
  addAnyEventListener(listener: EventListener): void;

  addEventListener<Event extends DomainEvent>(
    EventClass: ClassType<Event>,
    listener: EventListener<Event>
  ): void;

  emit(event: DomainEvent): void;
}
