import { Event } from '../../../events/event.entity';

export interface EventRepository {
  getEvent(eventId: string): Promise<Event | undefined>;
}
