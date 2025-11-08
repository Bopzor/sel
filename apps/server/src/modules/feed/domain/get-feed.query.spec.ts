import { createDate } from '@sel/utils';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { getFeed } from './get-feed.query';

describe('feed', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);

  it('retrieves the latest resources', async () => {
    const memberId = await persist.member();

    const requestId = await persist.request({
      requesterId: memberId,
      createdAt: createDate('2025-01-01'),
    });

    const eventId = await persist.event({
      organizerId: memberId,
      createdAt: createDate('2025-01-02'),
    });

    const informationId = await persist.information({
      authorId: memberId,
      createdAt: createDate('2025-01-03'),
    });

    expect(await getFeed({ pageSize: 10, page: 1, sortOrder: 'desc' })).toEqual({
      total: 3,
      items: [
        ['information', expect.objectContaining({ id: informationId })],
        ['event', expect.objectContaining({ id: eventId })],
        ['request', expect.objectContaining({ id: requestId })],
      ],
    });
  });
});
