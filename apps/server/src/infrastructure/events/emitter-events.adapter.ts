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

  addAnyEventListener(listener: EventListener): void {
    this.anyEventListeners.add((event: DomainEvent) => {
      void this.handleEvent(event, listener);
    });
  }

  addEventListener<Event extends DomainEvent>(
    EventClass: ClassType<Event>,
    listener: EventListener<Event>
  ): void {
    this.emitter.addListener(EventClass.name, (event: DomainEvent) => {
      void this.handleEvent(event, listener as EventListener);
    });
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
