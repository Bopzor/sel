import * as shared from '@sel/shared';
import { addDuration, createDate, createId } from '@sel/utils';
import { eq } from 'drizzle-orm';
import supertest from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { db, resetDatabase, schema } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { server } from 'src/server';
import { TOKENS } from 'src/tokens';

import { TokenType } from '../authentication/authentication.entities';

import { setEventParticipation } from './domain/set-event-participation.command';

describe('event router', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  let agent: ReturnType<typeof supertest.agent>;

  const tomorrow = addDuration(createDate(), { days: 1 });

  beforeEach(async () => {
    container.bindValue(TOKENS.events, new StubEvents());

    await db.insert(schema.config).values({ id: createId(), currency: '', currencyPlural: '' });

    await persist.member({ id: 'meId', roles: [shared.MemberRole.member] });

    await persist.token({
      memberId: 'meId',
      type: TokenType.session,
      value: 'token',
      expirationDate: tomorrow,
    });

    agent = supertest.agent(server()).set('Cookie', 'token=token');
  });

  async function listEvents(query: shared.ListEventsQuery = {}): Promise<shared.EventsListItem[]> {
    const response = await agent.get('/events').query(query).expect(200);

    return response.body as shared.EventsListItem[];
  }

  it('lists the events with their location and participants', async () => {
    const location = { line1: '1 rue de la Paix', postalCode: '75002', city: 'Paris', country: 'France' };

    await persist.event({ id: 'eventId', date: tomorrow, location });
    await persist.member({ id: 'otherId' });

    await setEventParticipation({ eventId: 'eventId', memberId: 'meId', participation: 'yes' });
    await setEventParticipation({ eventId: 'eventId', memberId: 'otherId', participation: 'no' });

    const [event] = await listEvents();

    expect(event).toHaveProperty('location', location);
    expect(event).toHaveProperty('participantsCount', 1);
    expect(event).toHaveProperty('participation', 'yes');
  });

  it('does not set the participation of a member who did not answer', async () => {
    await persist.event();

    const [event] = await listEvents();

    expect(event).toHaveProperty('participantsCount', 0);
    expect(event).not.toHaveProperty('participation');
  });

  it('lists the events between two dates', async () => {
    await persist.event({ id: 'beforeId', date: createDate('2026-06-01T00:00:00.000Z') });
    await persist.event({ id: 'afterBoundId', date: createDate('2026-06-02T00:00:00.000Z') });
    await persist.event({ id: 'betweenId', date: createDate('2026-06-05T00:00:00.000Z') });
    await persist.event({ id: 'beforeBoundId', date: createDate('2026-06-09T00:00:00.000Z') });
    await persist.event({ id: 'undatedId' });

    const events = await listEvents({
      after: '2026-06-02T00:00:00.000Z',
      before: '2026-06-09T00:00:00.000Z',
    });

    expect(events.map(({ id }) => id).sort()).toEqual(['afterBoundId', 'betweenId']);
  });

  describe('committee meeting', () => {
    const body = { title: 'Committee meeting', body: 'Agenda of the meeting', kind: 'internal' };

    async function joinCommittee() {
      await db
        .update(schema.members)
        .set({ roles: [shared.MemberRole.member, shared.MemberRole.committee] })
        .where(eq(schema.members.id, 'meId'));
    }

    it('lets a committee member create a committee meeting', async () => {
      await joinCommittee();

      const response = await agent
        .post('/events')
        .send({ ...body, committeeMeeting: true })
        .expect(201);

      const event = await agent.get(`/events/${response.text}`).expect(200);

      expect(event.body).toHaveProperty('committeeMeeting', true);
    });

    it('lets another member create an event that is not a committee meeting', async () => {
      const response = await agent.post('/events').send(body).expect(201);

      const event = await agent.get(`/events/${response.text}`).expect(200);

      expect(event.body).toHaveProperty('committeeMeeting', false);
    });

    it('forbids another member to create a committee meeting', async () => {
      await agent
        .post('/events')
        .send({ ...body, committeeMeeting: true })
        .expect(403);
    });

    it('forbids an external committee meeting', async () => {
      await joinCommittee();

      await agent
        .post('/events')
        .send({ ...body, kind: 'external', committeeMeeting: true })
        .expect(400);
    });

    it('lets a committee member mark their event as a committee meeting and unmark it', async () => {
      await joinCommittee();

      await persist.event({ id: 'eventId', organizerId: 'meId' });

      await agent
        .put('/events/eventId')
        .send({ ...body, committeeMeeting: true })
        .expect(204);
      expect((await agent.get('/events/eventId').expect(200)).body).toHaveProperty('committeeMeeting', true);

      await agent
        .put('/events/eventId')
        .send({ ...body, committeeMeeting: false })
        .expect(204);
      expect((await agent.get('/events/eventId').expect(200)).body).toHaveProperty('committeeMeeting', false);
    });

    it('forbids another member to mark their event as a committee meeting', async () => {
      await persist.event({ id: 'eventId', organizerId: 'meId' });

      await agent
        .put('/events/eventId')
        .send({ title: 'New title', body: 'New agenda', committeeMeeting: true })
        .expect(403);
    });

    it('forbids changing a committee meeting to external', async () => {
      await joinCommittee();

      await persist.event({ id: 'eventId', organizerId: 'meId', committeeMeeting: true });

      await agent
        .put('/events/eventId')
        .send({ title: 'New title', body: 'New agenda', kind: 'external' })
        .expect(400);
    });

    it('filters the committee meetings', async () => {
      await persist.event({ id: 'meetingId', committeeMeeting: true });
      await persist.event({ id: 'otherId' });

      expect((await listEvents({ committeeMeeting: 'true' })).map(({ id }) => id)).toEqual(['meetingId']);
      expect((await listEvents({ committeeMeeting: 'false' })).map(({ id }) => id)).toEqual(['otherId']);
    });
  });

  it('returns a 404 for an event that does not exist', async () => {
    await agent.get('/events/missingId').expect(404);
    await agent.put('/events/missingId/participation').send({ participation: 'yes' }).expect(404);
  });
});
