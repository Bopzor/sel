import * as shared from '@sel/shared';
import { addDuration, createDate, createId } from '@sel/utils';
import supertest from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { db, resetDatabase, schema } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { server } from 'src/server';

import { TokenType } from '../authentication/authentication.entities';

describe('feed router', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  let agent: ReturnType<typeof supertest.agent>;

  beforeEach(async () => {
    await db.insert(schema.config).values({ id: createId(), currency: '', currencyPlural: '' });

    await persist.member({ id: 'meId', roles: [shared.MemberRole.member] });

    await persist.token({
      memberId: 'meId',
      type: TokenType.session,
      value: 'token',
      expirationDate: addDuration(createDate(), { days: 1 }),
    });

    agent = supertest.agent(server()).set('Cookie', 'token=token');
  });

  it('lists the events with their date', async () => {
    const date = createDate('2025-06-01T18:00:00.000Z');

    await persist.event({ id: 'eventId', organizerId: 'meId', date });
    await persist.event({ id: 'undatedEventId', organizerId: 'meId' });

    const response = await agent.get('/feed').expect(200);
    const feed = response.body as shared.Feed;
    const event = (id: string) => feed.find(([, resource]) => resource.id === id)?.[1];

    expect(event('eventId')).toHaveProperty('date', date.toISOString());
    expect(event('undatedEventId')).not.toHaveProperty('date');
  });
});
