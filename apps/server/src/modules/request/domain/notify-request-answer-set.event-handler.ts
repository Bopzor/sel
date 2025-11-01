import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { memberName } from 'src/infrastructure/format';
import { findMemberById, Member } from 'src/modules/member';
import { GetNotificationContext, notify } from 'src/modules/notification';
import { db, schema } from 'src/persistence';

import {
  Request,
  RequestAnswer,
  RequestPositiveAnswerGivenEvent,
  RequestAnswerChangedToPositiveEvent,
  RequestAnswerChangedToNegativeEvent,
  RequestPositiveAnswerWithdrawnEvent,
} from '../request.entities';

export async function notifyRequestAnswerSet(
  domainEvent:
    | RequestPositiveAnswerGivenEvent
    | RequestAnswerChangedToPositiveEvent
    | RequestAnswerChangedToNegativeEvent
    | RequestPositiveAnswerWithdrawnEvent,
): Promise<void> {
  const { entityId: requestId } = domainEvent;
  const { respondentId } = domainEvent.payload;

  const request = defined(
    await db.query.requests.findFirst({
      where: eq(schema.requests.id, requestId),
      with: {
        requester: true,
      },
    }),
  );

  const respondent = defined(await findMemberById(respondentId));

  const domainEventTypeToAnswer: Record<(typeof domainEvent)['type'], RequestAnswer['answer'] | null> = {
    [RequestPositiveAnswerGivenEvent.type]: 'positive',
    [RequestAnswerChangedToPositiveEvent.type]: 'positive',
    [RequestAnswerChangedToNegativeEvent.type]: 'negative',
    [RequestPositiveAnswerWithdrawnEvent.type]: null,
  };

  await notify({
    memberIds: [request.requester.id],
    type: 'RequestAnswerSet',
    getContext: (member) =>
      getContext(member, request, respondent, domainEventTypeToAnswer[domainEvent.type]),
    sender: respondent,
  });
}

function getContext(
  member: Member,
  request: Request & { requester: Member },
  respondent: Member,
  answer: RequestAnswer['answer'] | null,
): ReturnType<GetNotificationContext<'RequestAnswerSet'>> {
  if (member.id !== request.requester.id || respondent.id === request.requester.id) {
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
  };
}
