import { Event } from '../../../events/event.entity';
import { InMemoryRepository } from '../../../in-memory.repository';

import { EventRepository } from './event.repository';

export class InMemoryEventRepository extends InMemoryRepository<Event> implements EventRepository {
  async getEvent(eventId: string): Promise<Event | undefined> {
    return this.get(eventId);
  }
}
