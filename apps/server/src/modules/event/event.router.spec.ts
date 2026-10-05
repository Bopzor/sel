import * as shared from '@sel/shared';
import { addDuration, createDate, createId } from '@sel/utils';
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
    await persist.member({ id: 'organizerId' });

    await persist.token({
      memberId: 'meId',
      type: TokenType.session,
      value: 'token',
      expirationDate: tomorrow,
    });

    agent = supertest.agent(server()).set('Cookie', 'token=token');
  });

  async function createEvent(values: Partial<Parameters<typeof persist.event>[0]> = {}) {
    return persist.event({ organizerId: 'organizerId', messageId: await persist.message(), ...values });
  }

  async function listEvents(query: shared.ListEventsQuery = {}): Promise<shared.EventsListItem[]> {
    const response = await agent.get('/events').query(query).expect(200);

    return response.body as shared.EventsListItem[];
  }

  it('lists the events with their location and participants', async () => {
    const location = { line1: '1 rue de la Paix', postalCode: '75002', city: 'Paris', country: 'France' };

    await createEvent({ id: 'eventId', date: tomorrow, location });
    await persist.member({ id: 'otherId' });

    await setEventParticipation({ eventId: 'eventId', memberId: 'meId', participation: 'yes' });
    await setEventParticipation({ eventId: 'eventId', memberId: 'otherId', participation: 'no' });

    const [event] = await listEvents();

    expect(event).toHaveProperty('location', location);
    expect(event).toHaveProperty('participantsCount', 1);
    expect(event).toHaveProperty('participation', 'yes');
  });

  it('does not set the participation of a member who did not answer', async () => {
    await createEvent();

    const [event] = await listEvents();

    expect(event).toHaveProperty('participantsCount', 0);
    expect(event).not.toHaveProperty('participation');
  });

  it('returns a 404 for an event that does not exist', async () => {
    await agent.get('/events/missingId').expect(404);
    await agent.put('/events/missingId/participation').send({ participation: 'yes' }).expect(404);
  });
});
