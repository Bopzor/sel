import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { findMemberById, Member } from 'src/modules/member';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { Event, EventParticipationSetEvent } from '../event.entities';

export async function notifyEventParticipationSet(domainEvent: EventParticipationSetEvent): Promise<void> {
  const { entityId: eventId } = domainEvent;
  const { participantId, previousParticipation, participation } = domainEvent.payload;

  const event = defined(
    await db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
      with: {
        organizer: true,
      },
    }),
  );

  const participant = defined(await findMemberById(participantId));

  await notify({
    memberIds: [event.organizer.id],
    type: 'EventParticipationSet',
    getContext: (member) => getContext(member, event, participant, participation, previousParticipation),
    sender: participant,
  });
}

function getContext(
  member: Member,
  event: Event & { organizer: Member },
  participant: Member,
  participation: shared.EventParticipation | null,
  previousParticipation: shared.EventParticipation | null,
): ReturnType<GetNotificationContext<'EventParticipationSet'>> {
  if (member.id !== event.organizer.id || participant.id === event.organizer.id) {
    return null;
  }

  if (participation !== 'yes' && previousParticipation !== 'yes') {
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
      },
    },
    participant: {
      id: participant.id,
      name: memberName(participant),
    },
    previousParticipation,
    participation,
  };
}
