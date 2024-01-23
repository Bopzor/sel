type EventListener<Event extends object = object> = (event: Event) => void | Promise<void>;

export class EventBus {
  private listeners = new Map<unknown, Array<EventListener>>();

  constructor(private readonly onError?: (error: unknown) => void) {}

  publisher() {
    return new EventPublisher(this);
  }

  addListener<Event extends object>(
    EventClass: { new (...params: unknown[]): Event },
    listener: EventListener<Event>
  ) {
    if (!this.listeners.has(EventClass)) {
      this.listeners.set(EventClass, []);
    }

    this.listeners.get(EventClass)?.push(listener as EventListener);
  }

  publish(event: object) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.listeners.get(event.constructor)?.forEach(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        this.onError?.(error);
      }
    });
  }
}

class EventPublisher {
  private events = new Array<object>();

  constructor(private eventBus: EventBus) {}

  prepare(event: object) {
    this.events.push(event);
  }

  commit() {
    this.events.forEach((event) => this.eventBus.publish(event));
  }
}
