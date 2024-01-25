import { EventPublisherPort } from './event-publisher.port';

export class StubEventPublisher implements EventPublisherPort {
  events = new Array<object>();

  publish(event: object) {
    this.events.push(event);
  }
}
