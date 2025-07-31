import { assert, unique } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { db, schema } from 'src/persistence';

import { Member } from '../../member';
import { GetNotificationContext, notify } from '../../notification';
import { Request, RequestCanceledEvent, RequestFulfilledEvent } from '../request.entities';

export async function notifyRequestStatusChanged(event: RequestFulfilledEvent | RequestCanceledEvent) {
  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, event.entityId),
    with: {
      requester: true,
      comments: true,
      answers: { where: eq(schema.requestAnswers.answer, 'positive') },
    },
  });

  assert(request !== undefined);

  const stakeholderIds = unique([
    request.requester.id,
    ...request.answers.map((answer) => answer.memberId),
    ...request.comments.map((comment) => comment.authorId),
  ]);

  await notify({
    memberIds: stakeholderIds,
    type: 'RequestStatusChanged',
    getContext: (member) => getContext(member, request),
  });
}

function getContext(
  member: Member,
  request: Request & { requester: Member },
): ReturnType<GetNotificationContext<'RequestStatusChanged'>> {
  if (member.id === request.requester.id) {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    request: {
      id: request.id,
      title: request.title,
      status: request.status,
      requester: {
        id: request.requester.id,
        name: memberName(request.requester),
      },
    },
  };
}
