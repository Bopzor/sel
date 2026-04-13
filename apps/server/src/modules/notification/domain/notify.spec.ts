import { MemberStatus } from '@sel/shared';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEmailSender } from 'src/infrastructure/email';
import { StubPushNotification } from 'src/infrastructure/push-notification';
import { StubStorage } from 'src/infrastructure/storage';
import { clearDatabase, db, resetDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

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

  it('delivers push notifications', async () => {
    const pushNotification = new StubPushNotification();

    container.bindValue(TOKENS.pushNotification, pushNotification);

    await persist.member({
      id: 'memberId',
      status: MemberStatus.active,
      notificationDelivery: [NotificationDeliveryType.push],
    });

    await persist.memberDevice({
      memberId: 'memberId',
    });

    await notify(params);

    expect(pushNotification.notifications.size).toEqual(1);
  });

  it('delivers email notifications', async () => {
    const emailSender = new StubEmailSender();
    const storage = new StubStorage();

    container.bindValue(TOKENS.emailSender, emailSender);
    container.bindValue(TOKENS.storage, storage);

    await persist.member({
      id: 'memberId',
      status: MemberStatus.active,
      notificationDelivery: [NotificationDeliveryType.email],
    });

    await persist.memberDevice({
      memberId: 'memberId',
    });

    await notify(params);

    expect(emailSender.emails).toHaveLength(1);
  });
});
