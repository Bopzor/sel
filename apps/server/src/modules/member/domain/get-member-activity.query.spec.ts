import * as shared from '@sel/shared';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { getMemberActivity } from './get-member-activity.query';

describe('getMemberActivity', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  beforeEach(async () => {
    await persist.member({ id: 'memberId' });
    await persist.member({ id: 'otherMemberId' });
    await persist.message({ id: 'messageId', html: '<p>Count me in</p>' });
  });

  const date = (day: number) => new Date(2026, 0, day);

  async function listActivity(query: Partial<Parameters<typeof getMemberActivity>[0]> = {}) {
    const { items } = await getMemberActivity({
      memberId: 'memberId',
      includeComments: false,
      page: 1,
      pageSize: 10,
      ...query,
    });

    return items;
  }

  it("lists the member's requests, events and information", async () => {
    await persist.request({
      id: 'requestId',
      requesterId: 'memberId',
      title: 'Help in the garden',
      messageId: 'messageId',
      createdAt: date(1),
    });

    await persist.event({
      id: 'eventId',
      organizerId: 'memberId',
      title: 'Picnic',
      messageId: 'messageId',
      date: date(10),
      createdAt: date(2),
    });

    await persist.information({
      id: 'informationId',
      authorId: 'memberId',
      title: 'New members',
      messageId: 'messageId',
      publishedAt: date(3),
    });

    expect(await listActivity()).toEqual<shared.MemberActivityItem[]>([
      {
        type: 'information',
        id: 'informationId',
        date: date(3).toISOString(),
        entity: { type: 'information', id: 'informationId', title: 'New members' },
      },
      {
        type: 'event',
        id: 'eventId',
        date: date(2).toISOString(),
        entity: { type: 'event', id: 'eventId', title: 'Picnic', date: date(10).toISOString() },
      },
      {
        type: 'request',
        id: 'requestId',
        date: date(1).toISOString(),
        entity: { type: 'request', id: 'requestId', title: 'Help in the garden' },
      },
    ]);
  });

  it('lists the requests the member offered to help on', async () => {
    await persist.request({
      id: 'requestId',
      requesterId: 'otherMemberId',
      title: 'Bread',
      messageId: 'messageId',
    });
    await persist.request({ id: 'otherRequestId', requesterId: 'otherMemberId', messageId: 'messageId' });

    await persist.requestAnswer({
      id: 'answerId',
      requestId: 'requestId',
      memberId: 'memberId',
      updatedAt: date(1),
    });
    await persist.requestAnswer({ requestId: 'otherRequestId', memberId: 'memberId', answer: 'negative' });

    expect(await listActivity()).toEqual<shared.MemberActivityItem[]>([
      {
        type: 'request-answer',
        id: 'answerId',
        date: date(1).toISOString(),
        entity: { type: 'request', id: 'requestId', title: 'Bread' },
      },
    ]);
  });

  it('lists the events the member attends', async () => {
    await persist.event({
      id: 'eventId',
      organizerId: 'otherMemberId',
      title: 'Picnic',
      messageId: 'messageId',
    });
    await persist.event({ id: 'otherEventId', organizerId: 'otherMemberId', messageId: 'messageId' });

    await persist.eventParticipation({
      id: 'participationId',
      eventId: 'eventId',
      participantId: 'memberId',
      updatedAt: date(1),
    });

    await persist.eventParticipation({
      eventId: 'otherEventId',
      participantId: 'memberId',
      participation: 'no',
    });

    expect(await listActivity()).toEqual<shared.MemberActivityItem[]>([
      {
        type: 'event-participation',
        id: 'participationId',
        date: date(1).toISOString(),
        entity: { type: 'event', id: 'eventId', title: 'Picnic', date: undefined },
      },
    ]);
  });

  it("lists the member's comments only when asked", async () => {
    await persist.request({
      id: 'requestId',
      requesterId: 'otherMemberId',
      title: 'Bread',
      messageId: 'messageId',
    });

    await persist.comment({
      id: 'commentId',
      authorId: 'memberId',
      requestId: 'requestId',
      messageId: 'messageId',
      date: date(1),
    });

    expect(await listActivity()).toEqual([]);

    expect(await listActivity({ includeComments: true })).toEqual<shared.MemberActivityItem[]>([
      {
        type: 'comment',
        id: 'commentId',
        date: date(1).toISOString(),
        entity: { type: 'request', id: 'requestId', title: 'Bread' },
        body: '<p>Count me in</p>',
      },
    ]);
  });

  it("lists the member's completed exchanges", async () => {
    const transaction = (values: Parameters<typeof persist.transaction>[0]) => {
      return persist.transaction({ creatorId: 'memberId', ...values });
    };

    await transaction({
      id: 'sentId',
      payerId: 'memberId',
      recipientId: 'otherMemberId',
      amount: 3,
      description: 'Bread',
      completedAt: date(2),
    });

    await transaction({
      id: 'receivedId',
      payerId: 'otherMemberId',
      recipientId: 'memberId',
      completedAt: date(1),
    });
    await transaction({
      payerId: 'memberId',
      recipientId: 'otherMemberId',
      status: shared.TransactionStatus.pending,
    });
    await transaction({
      payerId: 'memberId',
      recipientId: 'otherMemberId',
      status: shared.TransactionStatus.canceled,
    });

    const items = await listActivity();

    expect(items.map(({ id }) => id)).toEqual(['sentId', 'receivedId']);
    expect(items[0]).toMatchObject({
      type: 'transaction',
      date: date(2).toISOString(),
      amount: 3,
      description: 'Bread',
      payer: { id: 'memberId' },
      recipient: { id: 'otherMemberId' },
    });
  });

  it("does not list another member's activity", async () => {
    await persist.request({ requesterId: 'otherMemberId', messageId: 'messageId' });

    expect(await listActivity()).toEqual([]);
  });

  it('paginates the activity', async () => {
    for (let day = 1; day <= 3; day++) {
      await persist.request({
        id: `request${day}`,
        requesterId: 'memberId',
        messageId: 'messageId',
        createdAt: date(day),
      });
    }

    const { total, items } = await getMemberActivity({
      memberId: 'memberId',
      includeComments: false,
      page: 2,
      pageSize: 2,
    });

    expect(total).toBe(3);
    expect(items.map(({ id }) => id)).toEqual(['request1']);
  });
});
