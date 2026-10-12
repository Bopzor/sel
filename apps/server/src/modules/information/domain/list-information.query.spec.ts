import { createDate } from '@sel/utils';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { resetDatabase } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';

import { listInformation } from './list-information.query';

describe('listInformation', () => {
  beforeAll(resetDatabase);
  afterEach(clearDatabase);

  beforeEach(async () => {
    await persist.member({ id: 'meId' });
    await persist.member({ id: 'authorId' });
  });

  async function listInformationIds(query: Partial<Parameters<typeof listInformation>[0]> = {}) {
    const { information } = await listInformation({ page: 1, pageSize: 10, ...query });

    return information.map(({ id }) => id);
  }

  it('lists the information, the latest first', async () => {
    // cspell:words january
    await persist.information({ id: 'januaryId', publishedAt: createDate('2026-01-01') });
    await persist.information({ id: 'marchId', publishedAt: createDate('2026-03-01') });
    await persist.information({ id: 'newsId', authorId: null, publishedAt: createDate('2026-02-01') });

    expect(await listInformationIds()).toEqual(['marchId', 'newsId', 'januaryId']);
  });

  it('searches the information by title and message', async () => {
    await persist.information({ id: 'titleId', title: 'General assembly' });
    await persist.information({
      id: 'messageId',
      messageId: await persist.message({ text: 'Vote at the next ASSEMBLY' }),
    });
    await persist.information({ id: 'otherId', title: 'New website' });

    expect((await listInformationIds({ search: 'assembly' })).toSorted()).toEqual(['messageId', 'titleId']);
  });

  it('lists the information of an author', async () => {
    await persist.information({ id: 'mineId', authorId: 'meId' });
    await persist.information({ id: 'otherId', authorId: 'authorId' });
    await persist.information({ id: 'newsId', authorId: null });

    expect(await listInformationIds({ authorId: 'meId' })).toEqual(['mineId']);
  });

  it('paginates the information', async () => {
    await persist.information({ id: 'firstId', publishedAt: createDate('2026-03-01') });
    await persist.information({ id: 'secondId', publishedAt: createDate('2026-02-01') });
    await persist.information({ id: 'thirdId', publishedAt: createDate('2026-01-01') });

    const { total, information } = await listInformation({ page: 2, pageSize: 2 });

    expect(total).toBe(3);
    expect(information.map(({ id }) => id)).toEqual(['thirdId']);
  });
});
