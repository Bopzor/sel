import * as shared from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import { EventUpdatedEvent } from '../event.entities';
import { updateEvent as updateDatabaseEvent } from '../event.persistence';

export type UpdateEventCommand = {
  eventId: string;
  title?: string;
  body?: string;
  kind?: shared.EventKind;
  date?: string;
  location?: shared.Address;
};

export async function updateEvent(command: UpdateEventCommand): Promise<void> {
  const htmlParser = container.resolve(TOKENS.htmlParser);
  const events = container.resolve(TOKENS.events);

  await updateDatabaseEvent(command.eventId, {
    title: command.title,
    text: command.body ? htmlParser.getTextContent(command.body) : undefined,
    html: command.body,
    date: command.date ? new Date(command.date) : undefined,
    location: command.location,
    kind: command.kind,
  });

  events.publish(new EventUpdatedEvent(command.eventId));
}
