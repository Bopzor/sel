import { defined, get, hasProperty } from '@sel/utils';
import { memberName } from 'src/infrastructure/format';
import { findMemberById, Member } from 'src/modules/member';
import { notify } from 'src/modules/notification';
import { db } from 'src/persistence';

export type SendEventNotificationCommand = {
  eventId: string;
  senderId: string;
  recipients: 'participants' | 'non-participants' | 'all';
  title: string;
  content: string;
};

export async function sendEventNotification(command: SendEventNotificationCommand): Promise<void> {
  const sender = defined(await findMemberById(command.senderId));

  const event = defined(
    await db.query.events.findFirst({
      where: ({ id }, { eq }) => eq(id, command.eventId),
      with: { participants: { with: { member: true } } },
    }),
  );

  const participants = event.participants.map(get('member'));

  const isParticipant = (member: Member): boolean => {
    return participants.some(hasProperty('id', member.id));
  };

  await notify({
    type: 'EventCustomNotification',
    sender,
    getContext: (member) => {
      if (member.id === sender.id) {
        return null;
      }

      if (command.recipients === 'participants' && !isParticipant(member)) {
        return null;
      }

      if (command.recipients === 'non-participants' && isParticipant(member)) {
        return null;
      }

      return {
        member: {
          firstName: member.firstName,
        },
        sender: {
          name: memberName(sender),
        },
        event: {
          id: event.id,
          title: event.title,
        },
        notification: {
          title: command.title,
          content: {
            text: command.content,
            html: command.content,
          },
        },
      };
    },
  });
}
