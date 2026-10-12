import * as shared from '@sel/shared';
import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { BadRequest, Forbidden } from 'src/infrastructure/http';
import { findMemberById } from 'src/modules/member';
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
  committeeMeeting?: boolean;
  date?: string | null;
  location?: shared.Address | null;
  fileIds: string[];
};

export async function createEvent(command: CreateEventCommand): Promise<void> {
  const { eventId, organizerId, title, body, fileIds, kind, committeeMeeting, date, location } = command;

  const organizer = defined(await findMemberById(organizerId));

  if (committeeMeeting && !organizer.roles.includes(shared.MemberRole.committee)) {
    throw new Forbidden('Member must be a committee member');
  }

  if (committeeMeeting && kind !== shared.EventKind.internal) {
    throw new BadRequest('A committee meeting must be an internal event');
  }

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
    committeeMeeting,
    createdAt: now,
    updatedAt: now,
  });

  events.publish(new EventCreatedEvent(eventId, { organizerId }));
}
