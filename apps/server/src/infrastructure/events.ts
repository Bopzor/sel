import EventEmitter from 'node:events';
import util from 'node:util';

import { injectableClass } from 'ditox';

import { TOKENS } from 'src/tokens';

import { ErrorReporter } from './error-reporter';
import { Logger } from './logger';

export abstract class DomainEvent<Payload = never> {
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

type DomainEventListener<Event extends DomainEvent<unknown> = DomainEvent<unknown>> = (
  event: Event,
) => void | Promise<void>;

type DomainEventClass<Event extends DomainEvent<unknown>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): Event;
  type: string;
};

export type EventPublisher = {
  publish(event: DomainEvent<unknown>): void;
  commit(): void;
};

export interface Events {
  publish(event: DomainEvent<unknown>): void;

  publisher(): EventPublisher;

  addGlobalListener(listener: DomainEventListener): void;

  addListener<Event extends DomainEvent<unknown>>(
    EventClass: DomainEventClass<Event>,
    listener: DomainEventListener<Event>,
  ): void;

  waitForListeners(): Promise<void>;
}

export class EmitterEvents implements Events {
  static inject = injectableClass(this, TOKENS.logger, TOKENS.errorReporter);

  private events = new EventEmitter();
  private listeners = new Set<(event: DomainEvent<unknown>) => void>();

  private readonly promises = new Set<Promise<void>>();

  constructor(
    private readonly logger: Logger,
    private readonly errorReporter: ErrorReporter,
  ) {}

  publish(event: DomainEvent<unknown>) {
    this.listeners.forEach((listener) => listener(event));
    this.events.emit(event.type, event);
  }

  publisher(): EventPublisher {
    const events = new Set<DomainEvent<unknown>>();

    return {
      publish: (event) => events.add(event),
      commit: () => events.forEach((event) => this.publish(event)),
    };
  }

  addGlobalListener(listener: DomainEventListener): void {
    this.listeners.add(this.wrapListener(listener));
  }

  addListener<Event extends DomainEvent<unknown>>(
    EventClass: DomainEventClass<Event>,
    listener: DomainEventListener<Event>,
  ): void {
    this.events.addListener(EventClass.type, this.wrapListener(listener));
  }

  async waitForListeners(): Promise<void> {
    await Promise.all(this.promises);
  }

  private wrapListener<Event extends DomainEvent<unknown>>(listener: DomainEventListener<Event>) {
    const handleError = (error: unknown) => {
      void this.errorReporter.report(error);
      this.logger.error(`Error in event listener ${listener.name}`, util.inspect(error));
    };

    return (event: Event): void => {
      const promise = Promise.resolve(listener(event))
        .catch(handleError)
        .finally(() => this.promises.delete(promise));

      this.promises.add(promise);
    };
  }
}

export class StubEvents implements Events {
  public readonly events = new Set<DomainEvent<unknown>>();

  publish = this.events.add.bind(this.events);

  publisher(): EventPublisher {
    return { publish: () => {}, commit: () => {} };
  }

  addGlobalListener(): void {}
  addListener(): void {}
  async waitForListeners(): Promise<void> {}
}

export class StubEventPublisher implements EventPublisher {
  events = new Set<DomainEvent>();

  publish(event: DomainEvent): void {
    this.events.add(event);
  }

  commit(): void {}
}
