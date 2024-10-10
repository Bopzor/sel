import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { EventInsert } from './event.entities';

export async function findEventById(eventId: string) {
  return db.query.events.findFirst({
    where: eq(schema.events.id, eventId),
  });
}

export async function insertEvent(values: EventInsert) {
  return db.insert(schema.events).values(values);
}

export async function updateEvent(eventId: string, values: Partial<EventInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  return db
    .update(schema.events)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.events.id, eventId));
}
