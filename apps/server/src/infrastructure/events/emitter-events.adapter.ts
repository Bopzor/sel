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

  addEventListener<Event extends DomainEvent>(
    EventClass: ClassType<Event>,
    listener: EventListener<Event>
  ): void {
    this.emitter.addListener(EventClass.name, (event) => {
      void this.handleEvent(event, listener as EventListener<DomainEvent>);
    });
  }

  private async handleEvent(event: DomainEvent, listener: EventListener<DomainEvent>) {
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
  }
}
