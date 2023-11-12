import EventEmitter from 'node:events';

import { ClassType } from '@sel/utils';
import { injectableClass } from 'ditox';

import { DomainEvent } from '../../domain-event';
import { TOKENS } from '../../tokens';
import { LoggerPort } from '../logger/logger.port';

import { EventListener, EventsPort } from './events.port';

export class EmitterEventsAdapter implements EventsPort {
  static inject = injectableClass(this, TOKENS.logger);

  constructor(private readonly logger: LoggerPort) {}

  public throwErrors = false;
  private emitter = new EventEmitter();
  private anyEventListeners = new Set<EventListener>();

  addEventListener(listener: EventListener): void;

  addEventListener<Event extends DomainEvent>(
    EventClass: ClassType<Event>,
    listener: EventListener<Event>
  ): void;

  addEventListener(...args: unknown[]): void {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    let EventClass: undefined | ClassType<DomainEvent> = undefined;
    let listener: EventListener;

    if (args.length === 1) {
      [listener] = args as [EventListener];
    } else {
      [EventClass, listener] = args as [ClassType<DomainEvent>, EventListener];
    }

    const handler = (event: DomainEvent) => {
      void this.handleEvent(event, listener);
    };

    if (EventClass) {
      this.emitter.addListener(EventClass.name, handler);
    } else {
      this.anyEventListeners.add(handler);
    }
  }

  private async handleEvent(event: DomainEvent, listener: EventListener) {
    try {
      await listener(event);
    } catch (error) {
      // todo: report
      this.logger.error(error);

      if (this.throwErrors) {
        throw error;
      }
    }
  }

  emit(event: DomainEvent): void {
    this.emitter.emit(event.constructor.name, event);
    this.anyEventListeners.forEach((handler) => void handler(event));
  }
}
