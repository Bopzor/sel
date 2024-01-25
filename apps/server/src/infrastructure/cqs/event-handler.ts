export interface EventHandler<Event> {
  handle(event: Event): Promise<void>;
}
