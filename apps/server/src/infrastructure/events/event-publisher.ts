import { AsyncLocalStorage } from 'node:async_hooks';

import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { EventBus } from '../cqs/event-bus';

import { EventPublisherPort } from './event-publisher.port';

export class EventPublisher implements EventPublisherPort {
  static inject = injectableClass(this, TOKENS.eventBus);

  constructor(private eventBus: EventBus) {}

  private eventsStorage = new AsyncLocalStorage<Array<object>>();

  private get events() {
    return this.eventsStorage.getStore();
  }

  async provide(cb: () => Promise<void>) {
    const events: object[] = [];

    await this.eventsStorage.run(events, cb);

    for (const event of events) {
      this.eventBus.emit(event);
    }
  }

  publish(event: object) {
    if (this.events !== undefined) {
      this.events.push(event);
    } else {
      this.eventBus.emit(event);
    }
  }
}
