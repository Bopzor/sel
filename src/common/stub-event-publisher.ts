import { EventPublisher } from './cqs/event-publisher';
import { DomainEvent } from './ddd/domain-event';

export class StubEventPublisher extends Set<DomainEvent> implements EventPublisher {
  publish = this.add.bind(this);

  get events() {
    return Array.from(this.values());
  }
}
