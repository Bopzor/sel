import * as shared from '@sel/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';
import { Member } from '../members/member.entity';

class Test extends E2ETest {
  organizer!: Member;
  organizerToken!: string;

  member!: Member;
  memberToken!: string;

  async setup(): Promise<void> {
    [this.organizer, this.organizerToken] = await this.createAuthenticatedMember({
      firstName: 'Foo',
      lastName: 'Bar',
      email: 'requester',
    });

    [this.member, this.memberToken] = await this.createAuthenticatedMember({
      email: 'member',
      firstName: 'Machin',
      lastName: 'Truc',
    });
  }
}

describe('[E2E] Request', () => {
  let test: Test;
  let token: string;

  beforeAll(async () => {
    test = await E2ETest.create(Test);
  });

  afterAll(async () => {
    await test?.teardown();
  });

  beforeEach(async () => {
    await test.reset();
    token = test.organizerToken;
  });

  afterEach(async () => {
    await test?.waitForEventHandlers();
  });

  it('creates a new event', async () => {
    const { body: eventId } = await test.fetch<string>('/events', {
      token,
      method: 'POST',
      body: { title: 'title', body: '<p>body</p>', kind: shared.EventKind.internal },
    });

    expect(await test.fetch('/events', { token })).toHaveProperty<shared.Event[]>('body', [
      expect.objectContaining({
        id: eventId,
        title: 'title',
      }),
    ]);

    expect(await test.fetch(`/events/${eventId}`, { token })).toHaveProperty('body.body', '<p>body</p>');

    expect(await test.application.getMemberNotifications({ memberId: test.member.id })).toHaveProperty(
      'notifications.0',
      expect.objectContaining<Partial<shared.Notification>>({ type: 'EventCreated' }),
    );
  });

  it('updates an existing event', async () => {
    await test.create.event({ eventId: 'eventId', organizerId: test.organizer.id });

    await test.fetch('/events/eventId', {
      token,
      method: 'PUT',
      body: { title: 'updated', body: '<p>updated</p>' },
    });

    expect(await test.fetch('/events', { token })).toHaveProperty<shared.Event[]>('body', [
      expect.objectContaining({
        id: 'eventId',
        title: 'updated',
      }),
    ]);

    expect(await test.fetch('/events/eventId', { token })).toHaveProperty('body.body', '<p>updated</p>');
  });

  it("sets an event's participation", async () => {
    await test.create.event({ eventId: 'eventId', organizerId: test.organizer.id, title: 'title' });

    await test.fetch('/events/eventId/participation', {
      token: test.memberToken,
      method: 'PUT',
      body: { participation: 'yes' },
    });

    expect(await test.fetch('/events/eventId', { token })).toHaveProperty('body.participants', [
      expect.objectContaining({ id: test.member.id }),
    ]);

    await test.waitForEventHandlers();

    expect(await test.application.getMemberNotifications({ memberId: test.organizer.id })).toHaveProperty(
      'notifications.0.type',
      'EventParticipationSet',
    );
  });

  it('creates a comment on an event', async () => {
    await test.create.event({ eventId: 'eventId', organizerId: test.organizer.id, title: 'title' });

    await test.fetch('/events/eventId/comment', {
      token: test.memberToken,
      method: 'POST',
      body: { body: '<p>body</p>' },
    });

    expect(await test.fetch('/events/eventId', { token })).toHaveProperty('body.comments', [
      expect.objectContaining({ body: '<p>body</p>' }),
    ]);

    await test.waitForEventHandlers();

    expect(await test.application.getMemberNotifications({ memberId: test.organizer.id })).toHaveProperty(
      'notifications.0.type',
      'EventCommentCreated',
    );
  });
});
