import * as shared from '@sel/shared';
import { addDuration, createDate, createId } from '@sel/utils';
import supertest from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { db, resetDatabase, schema } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { server } from 'src/server';

import { TokenType } from '../authentication/authentication.entities';

describe('request router', () => {
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

  it('lists the requests with their number of positive answers', async () => {
    await persist.member({ id: 'member1Id' });
    await persist.member({ id: 'member2Id' });
    await persist.request({ id: 'requestId', requesterId: 'meId' });
    await persist.requestAnswer({ requestId: 'requestId', memberId: 'member1Id', answer: 'positive' });
    await persist.requestAnswer({ requestId: 'requestId', memberId: 'member2Id', answer: 'negative' });

    const response = await agent.get('/requests').expect(200);

    expect(response.body).toEqual([expect.objectContaining({ id: 'requestId', positiveAnswersCount: 1 })]);
  });
});
