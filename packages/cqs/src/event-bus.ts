type ClassType<T> = {
  new (...params: unknown[]): T;
};

interface EventListener<Event extends object = object> {
  (event: Event): void | Promise<void>;
}

export class EventBus {
  private listeners = new Map<unknown, Array<EventListener>>();
  protected promises = new Set<Promise<void>>();

  constructor(private readonly onError?: (error: unknown) => void) {}

  addListener<Event extends object>(EventClass: ClassType<Event> | null, listener: EventListener<Event>) {
    if (!this.listeners.has(EventClass)) {
      this.listeners.set(EventClass, []);
    }

    this.listeners.get(EventClass)?.push(listener as EventListener);
  }

  emit(event: object) {
    this.getListeners(event).forEach((listener) => {
      const promise = Promise.resolve()
        .then(() => listener(event))
        .catch(this.onError)
        .finally(() => this.promises.delete(promise));

      this.promises.add(promise);
    });
  }

  private getListeners(event: object) {
    return [
      //
      ...(this.listeners.get(event.constructor) ?? []),
      ...(this.listeners.get(null) ?? []),
    ];
  }
}
