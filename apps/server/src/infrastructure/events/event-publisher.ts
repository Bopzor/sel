import { AsyncLocalStorage } from 'node:async_hooks';

import { defined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { EventBus } from '../cqs/event-bus';

import { EventPublisherPort } from './event-publisher.port';

export class EventPublisher implements EventPublisherPort {
  static inject = injectableClass(this, TOKENS.eventBus);

  constructor(private eventBus: EventBus) {}

  private eventsStorage = new AsyncLocalStorage<Array<object>>();

  private get events() {
    return defined(this.eventsStorage.getStore(), 'Missing events storage');
  }

  async provide(cb: () => Promise<void>) {
    const events: object[] = [];

    await this.eventsStorage.run(events, cb);

    for (const event of events) {
      this.eventBus.publish(event);
    }
  }

  publish(event: object) {
    this.events.push(event);
  }
}
