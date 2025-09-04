import { assert, defined, hasProperty, unique } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Comment } from 'src/modules/comment';
import { CommentCreatedEvent } from 'src/modules/comment/comment.entities';
import { Information } from 'src/modules/information/information.entities';
import { findMemberById, Member } from 'src/modules/member';
import { Message, withAttachments } from 'src/modules/messages/message.entities';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

export async function notifyInformationCommentCreated(event: CommentCreatedEvent) {
  if (event.payload.entityType !== 'information') {
    return;
  }

  const { entityId: commentId } = event;
  const { entityId: informationId, commentAuthorId } = event.payload;

  const information = await db.query.information.findFirst({
    where: eq(schema.information.id, informationId),
    with: {
      author: true,
      comments: { with: { message: withAttachments } },
    },
  });

  assert(information !== undefined);

  const comment = defined(information.comments.find(hasProperty('id', commentId)));
  const author = defined(await findMemberById(commentAuthorId));

  const stakeholderIds = unique([
    ...(information.author ? [information.author.id] : []),
    ...information.comments.map((comment) => comment.authorId),
  ]);

  await notify({
    memberIds: stakeholderIds,
    type: 'InformationCommentCreated',
    getContext: (member) => getContext(member, information, comment, author),
    sender: author,
    attachments: comment.message.attachments,
  });
}

function getContext(
  member: Member,
  information: Information & { author: Member | null },
  comment: Comment & { message: Message },
  author: Member,
): ReturnType<GetNotificationContext<'InformationCommentCreated'>> {
  if (member.id === author.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    isPublisher: information.author?.id === member.id,
    information: {
      id: information.id,
      title: information.title,
      author: information.author
        ? {
            id: information.author.id,
            name: memberName(information.author),
          }
        : undefined,
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
