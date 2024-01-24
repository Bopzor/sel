import { ClassType } from '@sel/utils';

type EventListener<Event extends object = object> = (event: Event) => void | Promise<void>;

export class EventBus {
  private listeners = new Map<unknown, Array<EventListener>>();

  constructor(private readonly onError?: (error: unknown) => void) {}

  addListener<Event extends object>(EventClass: ClassType<Event> | null, listener: EventListener<Event>) {
    if (!this.listeners.has(EventClass)) {
      this.listeners.set(EventClass, []);
    }
    this.listeners.get(EventClass)?.push(listener as EventListener);
  }

  publish(event: object) {
    this.getListeners(event).forEach((listener) => {
      void Promise.resolve()
        .then(() => listener(event))
        .catch(this.onError);
    });
  }

  private getListeners(event: object) {
    return [...(this.listeners.get(event.constructor) ?? []), ...(this.listeners.get(null) ?? [])];
  }
}
