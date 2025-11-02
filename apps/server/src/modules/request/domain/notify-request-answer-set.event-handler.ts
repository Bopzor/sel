import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { findMemberById, Member } from 'src/modules/member';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import {
  Request,
  RequestAnswer,
  RequestAnswerWithdrawnEvent,
  RequestNegativeAnswerGivenEvent,
  RequestPositiveAnswerGivenEvent,
} from '../request.entities';

export async function notifyRequestAnswerSet(
  domainEvent:
    | RequestPositiveAnswerGivenEvent
    | RequestNegativeAnswerGivenEvent
    | RequestAnswerWithdrawnEvent,
): Promise<void> {
  const { entityId: requestId } = domainEvent;
  const { respondentId, previousAnswer } = domainEvent.payload;

  let answer: RequestAnswer['answer'] | null = null;

  if (domainEvent.type === RequestPositiveAnswerGivenEvent.type) {
    answer = 'positive';
  }

  if (domainEvent.type === RequestNegativeAnswerGivenEvent.type) {
    answer = 'negative';
  }

  const request = defined(
    await db.query.requests.findFirst({
      where: eq(schema.requests.id, requestId),
      with: {
        requester: true,
      },
    }),
  );

  const respondent = defined(await findMemberById(respondentId));

  await notify({
    memberIds: [request.requester.id],
    type: 'RequestAnswerSet',
    getContext: (member) => getContext(member, request, respondent, answer, previousAnswer),
    sender: respondent,
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

  const isPositiveAnswer = answer === 'positive';
  const isPositiveAnswerChanged = previousAnswer === 'positive' && answer !== 'positive';

  if (!isPositiveAnswer && !isPositiveAnswerChanged) {
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
    answer,
    previousAnswer,
  };
}
