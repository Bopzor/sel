import { assert, defined, hasProperty, unique } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Message, withAttachments } from 'src/modules/messages/message.entities';
import { db, schema } from 'src/persistence';

import { Comment } from '../../comment';
import { findMemberById, Member } from '../../member';
import { GetNotificationContext, notify } from '../../notification';
import { Information, InformationCommentCreatedEvent } from '../information.entities';

export async function notifyInformationCommentCreated(event: InformationCommentCreatedEvent) {
  const information = await db.query.information.findFirst({
    where: eq(schema.information.id, event.entityId),
    with: {
      author: true,
      comments: { with: { message: withAttachments } },
    },
  });

  assert(information !== undefined);

  const comment = defined(information.comments.find(hasProperty('id', event.payload.commentId)));
  const author = defined(await findMemberById(event.payload.authorId));

  const stakeholderIds = unique([
    ...(information.author ? [information.author.id] : []),
    ...information.comments.map((comment) => comment.authorId),
  ]);

  await notify({
    memberIds: stakeholderIds,
    type: 'InformationCommentCreated',
    getContext: (member) => getContext(member, information, comment, author),
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
