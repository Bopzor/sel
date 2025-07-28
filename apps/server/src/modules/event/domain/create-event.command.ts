import * as shared from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { insertMessage } from 'src/modules/messages/message.persistence';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { EventCreatedEvent } from '../event.entities';

export type CreateEventCommand = {
  eventId: string;
  organizerId: string;
  title: string;
  body: string;
  kind: shared.EventKind;
  date?: string;
  location?: shared.Address;
};

export async function createEvent(command: CreateEventCommand): Promise<void> {
  const { eventId, organizerId, title, body, kind, date, location } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.events).values({
    id: eventId,
    organizerId: organizerId,
    title: title,
    messageId: await insertMessage(body),
    date: date ? new Date(date) : undefined,
    location: location,
    kind: kind,
    createdAt: now,
    updatedAt: now,
  });

  events.publish(new EventCreatedEvent(eventId, { organizerId }));
}
