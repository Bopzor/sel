import * as shared from '@sel/shared';
import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { BadRequest, Forbidden } from 'src/infrastructure/http';
import { findMemberById } from 'src/modules/member';
import { updateMessage } from 'src/modules/messages/message.persistence';
import { TOKENS } from 'src/tokens';

import { EventUpdatedEvent } from '../event.entities';
import { findEventById, updateEvent as updateDatabaseEvent } from '../event.persistence';

export type UpdateEventCommand = {
  eventId: string;
  memberId: string;
  title?: string;
  body?: string;
  fileIds: string[];
  kind?: shared.EventKind;
  committeeMeeting?: boolean;
  date?: string | null;
  location?: shared.Address | null;
};

export async function updateEvent(command: UpdateEventCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const member = defined(await findMemberById(command.memberId));
  const event = defined(await findEventById(command.eventId));

  if (command.committeeMeeting && !member.roles.includes(shared.MemberRole.committee)) {
    throw new Forbidden('Member must be a committee member');
  }

  const committeeMeeting = command.committeeMeeting ?? event.committeeMeeting;
  const kind = command.kind ?? event.kind;

  if (committeeMeeting && kind !== shared.EventKind.internal) {
    throw new BadRequest('A committee meeting must be an internal event');
  }

  await updateDatabaseEvent(event.id, {
    title: command.title,
    date: command.date == null ? command.date : new Date(command.date),
    location: command.location,
    kind: command.kind,
    committeeMeeting: command.committeeMeeting,
  });

  if (command.body) {
    await updateMessage(event.messageId, command.body, command.fileIds);
  }

  events.publish(new EventUpdatedEvent(command.eventId));
}
