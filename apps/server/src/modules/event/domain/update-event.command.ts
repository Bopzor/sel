import * as shared from '@sel/shared';
import { defined } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { updateMessage } from 'src/modules/messages/message.persistence';
import { TOKENS } from 'src/tokens';

import { EventUpdatedEvent } from '../event.entities';
import { findEventById, updateEvent as updateDatabaseEvent } from '../event.persistence';

export type UpdateEventCommand = {
  eventId: string;
  title?: string;
  body?: string;
  kind?: shared.EventKind;
  date?: string;
  location?: shared.Address;
};

export async function updateEvent(command: UpdateEventCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const event = defined(await findEventById(command.eventId));

  await updateDatabaseEvent(event.id, {
    title: command.title,
    date: command.date ? new Date(command.date) : undefined,
    location: command.location,
    kind: command.kind,
  });

  if (command.body) {
    await updateMessage(event.messageId, command.body);
  }

  events.publish(new EventUpdatedEvent(command.eventId));
}
