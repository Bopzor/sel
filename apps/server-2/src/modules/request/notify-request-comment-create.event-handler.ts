import { assert, defined, hasProperty, unique } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { db, schema } from 'src/persistence';

import { comment } from '../comment/comment.entities';
import { Member, memberName } from '../member/member.entities';
import { findMemberById } from '../member/member.persistence';
import { GetNotificationContext, notify } from '../notification/notify';

import { Request, RequestCommentCreatedEvent } from './request.entities';

export async function notifyRequestCommentCreated(event: RequestCommentCreatedEvent) {
  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, event.entityId),
    with: {
      requester: true,
      comments: true,
      answers: { where: eq(schema.requestAnswers.answer, 'positive') },
    },
  });

  assert(request !== undefined);

  const comment = defined(request.comments.find(hasProperty('id', event.payload.commentId)));
  const author = defined(await findMemberById(event.payload.authorId));

  const stakeholderIds = unique([
    request.requester.id,
    ...request.answers.map((answer) => answer.memberId),
    ...request.comments.map((comment) => comment.authorId),
  ]);

  await notify(stakeholderIds, 'RequestCommentCreated', (member) =>
    getContext(member, request, comment, author),
  );
}

function getContext(
  member: Member,
  request: Request & { requester: Member },
  comment: comment,
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
        html: comment.html,
        text: comment.text,
      },
    },
  };
}
