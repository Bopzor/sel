import EventEmitter from 'node:events';

export abstract class DomainEvent<Payload = never> {
  public abstract readonly entity: string;

  public readonly type: string;
  public readonly entityId: string;
  public readonly payload: Payload;

  static get type() {
    return this.name.replace(/Event$/, '');
  }

  constructor(entityId: string, ...[payload]: [Payload] extends [never] ? [] : [Payload]) {
    this.type = new.target.name.replace(/Event$/, '');
    this.entityId = entityId;
    this.payload = payload as Payload;
  }
}

type AnyDomainEvent = DomainEvent<unknown>;
type DomainEventHandler<Event extends AnyDomainEvent> = (event: Event) => void | Promise<void>;

type DomainEventClass<Event extends AnyDomainEvent> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): Event;
  type: string;
};

class Events {
  private events = new EventEmitter();
  private listeners = new Set<DomainEventHandler<AnyDomainEvent>>();

  emit(event: AnyDomainEvent) {
    this.listeners.forEach((listener) => void listener(event));
    this.events.emit(event.type, event);
  }

  addGlobalListener(cb: DomainEventHandler<AnyDomainEvent>): void {
    this.listeners.add(cb);
  }

  addListener<Event extends AnyDomainEvent>(
    EventClass: DomainEventClass<Event>,
    cb: (event: Event) => void,
  ): void {
    this.events.addListener(EventClass.type, cb);
  }
}

export const events = new Events();
