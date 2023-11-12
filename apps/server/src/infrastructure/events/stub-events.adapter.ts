import { ClassType } from '@sel/utils';

import { DomainEvent } from '../../domain-event';

import { EventListener, EventsPort } from './events.port';

export class StubEventsAdapter implements EventsPort {
  public readonly listeners = new Map<ClassType<DomainEvent>, Array<EventListener<DomainEvent>>>();
  public readonly events = new Array<DomainEvent>();

  addEventListener<Event extends DomainEvent>(event: ClassType<Event>, listener: EventListener<Event>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)?.push(listener as EventListener<DomainEvent>);
  }

  async trigger(event: DomainEvent) {
    const listeners = this.listeners.get(event.constructor as ClassType<DomainEvent>);

    if (!listeners) {
      throw new Error(`No listeners for event ${event.constructor.name}`);
    }

    await Promise.all(listeners.map((listener) => listener(event)));
  }

  emit(event: DomainEvent): void {
    this.events.push(event);
  }
}
