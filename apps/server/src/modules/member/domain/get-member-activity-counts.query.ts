import * as shared from '@sel/shared';
import { awaitProperties } from '@sel/utils';
import { and, eq } from 'drizzle-orm';

import { db, schema } from 'src/persistence';

export async function getMemberActivityCounts(memberId: string): Promise<shared.MemberActivityCounts> {
  const { requests, events, information, requestAnswers, eventParticipations, comments } = schema;

  return awaitProperties({
    requests: db.$count(requests, eq(requests.requesterId, memberId)),
    requestAnswers: db.$count(
      requestAnswers,
      and(eq(requestAnswers.memberId, memberId), eq(requestAnswers.answer, 'positive')),
    ),
    events: db.$count(events, eq(events.organizerId, memberId)),
    eventParticipations: db.$count(
      eventParticipations,
      and(eq(eventParticipations.participantId, memberId), eq(eventParticipations.participation, 'yes')),
    ),
    information: db.$count(information, eq(information.authorId, memberId)),
    comments: db.$count(comments, eq(comments.authorId, memberId)),
  });
}
