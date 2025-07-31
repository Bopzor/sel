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
  fileIds: string[];
};

export async function createEvent(command: CreateEventCommand): Promise<void> {
  const { eventId, organizerId, title, body, fileIds, kind, date, location } = command;

  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  await db.insert(schema.events).values({
    id: eventId,
    organizerId,
    title,
    messageId: await insertMessage(body, fileIds),
    date: date ? new Date(date) : undefined,
    location,
    kind,
    createdAt: now,
    updatedAt: now,
  });

  events.publish(new EventCreatedEvent(eventId, { organizerId }));
}
