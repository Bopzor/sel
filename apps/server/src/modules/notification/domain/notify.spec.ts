import { MemberStatus } from '@sel/shared';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { clearDatabase, db, resetDatabase } from 'src/persistence/database';

import { NotificationDeliveryType } from '../notification.entities';

import { notify } from './notify';

describe('notify', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);

  const params: Parameters<typeof notify>[0] = {
    type: 'Test',
    getContext() {
      return {
        member: { firstName: 'FirstName' },
        answer: 42,
        content: { text: 'text', html: '<p>html</p>' },
      };
    },
  };

  it('notifies all members', async () => {
    await persist.member({
      id: 'memberId',
      status: MemberStatus.active,
      notificationDelivery: [NotificationDeliveryType.email],
    });

    await notify(params);

    expect(await db.query.notifications.findMany()).toHaveLength(1);
  });

  it('excludes non-active members', async () => {
    await persist.member({
      id: 'memberId',
      status: MemberStatus.inactive,
      notificationDelivery: [NotificationDeliveryType.email],
    });

    await notify(params);

    expect(await db.query.notifications.findMany()).toHaveLength(0);
  });
});
