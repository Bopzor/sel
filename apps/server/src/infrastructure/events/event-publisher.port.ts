export interface EventPublisherPort {
  publish(event: object): void;
}
