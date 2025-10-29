import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { findMemberById, Member } from 'src/modules/member';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import { Request, RequestAnswer, RequestAnswerSetEvent } from '../request.entities';

export async function notifyRequestAnswerSet(domainEvent: RequestAnswerSetEvent): Promise<void> {
  const { entityId: requestId } = domainEvent;
  const { respondentId, previousAnswer, answer } = domainEvent.payload;

  const request = defined(
    await db.query.requests.findFirst({
      where: eq(schema.requests.id, requestId),
      with: {
        requester: true,
      },
    }),
  );

  const participant = defined(await findMemberById(respondentId));

  await notify({
    memberIds: [request.requester.id],
    type: 'RequestAnswerSet',
    getContext: (member) => getContext(member, request, participant, answer, previousAnswer),
    sender: participant,
  });
}

function getContext(
  member: Member,
  request: Request & { requester: Member },
  respondent: Member,
  answer: RequestAnswer['answer'] | null,
  previousAnswer: RequestAnswer['answer'] | null,
): ReturnType<GetNotificationContext<'RequestAnswerSet'>> {
  if (member.id !== request.requester.id || respondent.id === request.requester.id) {
    return null;
  }

  if (answer !== 'positive' && previousAnswer !== 'positive') {
    return null;
  }

  return {
    member: {
      firstName: member.firstName,
    },
    request: {
      id: request.id,
      title: request.title,
      requester: {
        id: request.requester.id,
      },
    },
    respondent: {
      id: respondent.id,
      name: memberName(respondent),
    },
    previousAnswer,
    answer,
  };
}
