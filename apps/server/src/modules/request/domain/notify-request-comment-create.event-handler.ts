import { assert, defined, hasProperty, unique } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { Comment } from 'src/modules/comment';
import { CommentCreatedEvent } from 'src/modules/comment/comment.entities';
import { findMemberById, Member } from 'src/modules/member';
import { Message, withAttachments } from 'src/modules/messages/message.entities';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { Request } from 'src/modules/request/request.entities';
import { db, schema } from 'src/persistence';

export async function notifyRequestCommentCreated(event: CommentCreatedEvent) {
  if (event.payload.entityType !== 'request') {
    return;
  }

  const { entityId: commentId } = event;
  const { entityId: requestId, commentAuthorId } = event.payload;

  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, requestId),
    with: {
      requester: true,
      comments: { with: { message: withAttachments } },
      answers: { where: eq(schema.requestAnswers.answer, 'positive') },
    },
  });

  assert(request !== undefined);

  const comment = defined(request.comments.find(hasProperty('id', commentId)));
  const author = defined(await findMemberById(commentAuthorId));

  const stakeholderIds = unique([
    request.requester.id,
    ...request.answers.map((answer) => answer.memberId),
    ...request.comments.map((comment) => comment.authorId),
  ]);

  await notify({
    memberIds: stakeholderIds,
    type: 'RequestCommentCreated',
    getContext: (member) => getContext(member, request, comment, author),
    sender: author,
    attachments: comment.message.attachments,
  });
}

function getContext(
  member: Member,
  request: Request & { requester: Member },
  comment: Comment & { message: Message },
  author: Member,
): ReturnType<GetNotificationContext<'RequestCommentCreated'>> {
  if (member.id === author.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    isRequester: request.requester.id === member.id,
    request: {
      id: request.id,
      title: request.title,
      requester: {
        id: request.requester.id,
        name: memberName(request.requester),
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
