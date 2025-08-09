import { defined, hasProperty, unique } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Comment } from 'src/modules/comment';
import { CommentCreatedEvent } from 'src/modules/comment/comment.entities';
import { Event } from 'src/modules/event/event.entities';
import { findMemberById, Member } from 'src/modules/member';
import { Message, withAttachments } from 'src/modules/messages/message.entities';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

export async function notifyEventCommentCreated(domainEvent: CommentCreatedEvent): Promise<void> {
  if (domainEvent.payload.entityType !== 'event') {
    return;
  }

  const { entityId: commentId } = domainEvent;
  const { entityId: eventId, commentAuthorId } = domainEvent.payload;

  const event = defined(
    await db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
      with: {
        organizer: true,
        comments: { with: { message: withAttachments } },
        participants: { where: eq(schema.eventParticipations.participation, 'yes') },
      },
    }),
  );

  const comment = defined(event.comments.find(hasProperty('id', commentId)));
  const author = defined(await findMemberById(commentAuthorId));

  const stakeholderIds = unique([
    event.organizer.id,
    ...event.participants.map((participant) => participant.participantId),
    ...event.comments.map((comment) => comment.authorId),
  ]);

  await notify({
    memberIds: stakeholderIds,
    type: 'EventCommentCreated',
    getContext: (member) => getContext(member, event, comment, author),
    attachments: comment.message.attachments,
  });
}

function getContext(
  member: Member,
  event: Event & { organizer: Member },
  comment: Comment & { message: Message },
  author: Member,
): ReturnType<GetNotificationContext<'EventCommentCreated'>> {
  if (member.id === author.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    isOrganizer: event.organizer.id === member.id,
    event: {
      id: event.id,
      title: event.title,
      organizer: {
        id: event.organizer.id,
        name: memberName(event.organizer),
      },
    },
    comment: {
      id: comment.id,
      author: {
        id: author.id,
        name: memberName(author),
      },
      body: {
        html: comment.message.html,
        text: comment.message.text,
      },
    },
  };
}
