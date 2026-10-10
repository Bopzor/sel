import * as shared from '@sel/shared';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { getMemberActivityCounts } from './get-member-activity-counts.query';

describe('getMemberActivityCounts', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  beforeEach(async () => {
    await persist.member({ id: 'memberId' });
    await persist.member({ id: 'matId' });
    await persist.message({ id: 'messageId' });
  });

  it("counts the member's activity", async () => {
    await persist.request({ requesterId: 'memberId', messageId: 'messageId' });
    await persist.request({ id: 'requestId', requesterId: 'matId', messageId: 'messageId' });
    await persist.request({ id: 'otherRequestId', requesterId: 'matId', messageId: 'messageId' });

    await persist.requestAnswer({ requestId: 'requestId', memberId: 'memberId', answer: 'positive' });
    await persist.requestAnswer({ requestId: 'otherRequestId', memberId: 'memberId', answer: 'negative' });

    await persist.event({ organizerId: 'memberId', messageId: 'messageId' });
    await persist.event({ id: 'eventId', organizerId: 'matId', messageId: 'messageId' });
    await persist.event({ id: 'otherEventId', organizerId: 'matId', messageId: 'messageId' });

    await persist.eventParticipation({ eventId: 'eventId', participantId: 'memberId', participation: 'yes' });
    await persist.eventParticipation({
      eventId: 'otherEventId',
      participantId: 'memberId',
      participation: 'no',
    });

    await persist.information({ authorId: 'memberId', messageId: 'messageId' });

    await persist.comment({ authorId: 'memberId', requestId: 'requestId', messageId: 'messageId' });
    await persist.comment({ authorId: 'matId', requestId: 'requestId', messageId: 'messageId' });

    expect(await getMemberActivityCounts('memberId')).toEqual<shared.MemberActivityCounts>({
      requests: 1,
      requestAnswers: 1,
      events: 1,
      eventParticipations: 1,
      information: 1,
      comments: 1,
    });
  });
});
