import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Member } from 'src/modules/member';
import { Message, withAttachments } from 'src/modules/messages/message.entities';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { Event, EventCreatedEvent } from '../event.entities';

export async function notifyEventCreated({ entityId: eventId }: EventCreatedEvent): Promise<void> {
  const event = defined(
    await db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
      with: {
        organizer: true,
        message: withAttachments,
      },
    }),
  );

  await notify({
    type: 'EventCreated',
    getContext: (member) => getContext(member, event),
    sender: event.organizer,
    attachments: event.message.attachments,
  });
}

function getContext(
  member: Member,
  event: Event & { organizer: Member; message: Message },
): ReturnType<GetNotificationContext<'EventCreated'>> {
  if (member.id === event.organizer.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    event: {
      id: event.id,
      title: event.title,
      organizer: {
        id: event.organizer.id,
        name: memberName(event.organizer),
      },
      body: {
        html: event.message.html,
        text: event.message.text,
      },
    },
  };
}
