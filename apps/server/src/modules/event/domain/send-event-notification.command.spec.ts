import { beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEvents } from 'src/infrastructure/events';
import { StubPushNotification } from 'src/infrastructure/push-notification';
import { db } from 'src/persistence';
import { clearDatabase } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { NotificationDeliveryType } from '../../notification/notification.entities';

import { sendEventNotification, SendEventNotificationCommand } from './send-event-notification.command';
import { setEventParticipation } from './set-event-participation.command';

describe('sendEventNotification', () => {
  let command: SendEventNotificationCommand;

  beforeEach(async () => {
    await clearDatabase();

    container.bindValue(TOKENS.events, new StubEvents());
    container.bindValue(TOKENS.pushNotification, new StubPushNotification());

    for (const id of ['organizerId', 'goingId', 'notGoingId', 'otherId']) {
      await persist.member({ id, notificationDelivery: [NotificationDeliveryType.push] });
    }

    await persist.event({ id: 'eventId', organizerId: 'organizerId', messageId: await persist.message() });

    await setEventParticipation({ eventId: 'eventId', memberId: 'goingId', participation: 'yes' });
    await setEventParticipation({ eventId: 'eventId', memberId: 'notGoingId', participation: 'no' });

    command = {
      eventId: 'eventId',
      senderId: 'organizerId',
      recipients: 'participants',
      title: 'Title',
      content: 'Content',
    };
  });

  async function getRecipients() {
    const notifications = await db.query.notifications.findMany();

    return notifications.map(({ memberId }) => memberId).sort();
  }

  it('notifies the members who answered yes', async () => {
    await sendEventNotification({ ...command, recipients: 'participants' });

    expect(await getRecipients()).toEqual(['goingId']);
  });

  it('notifies the members who did not answer yes', async () => {
    await sendEventNotification({ ...command, recipients: 'non-participants' });

    expect(await getRecipients()).toEqual(['notGoingId', 'otherId']);
  });

  it('notifies all the members except the sender', async () => {
    await sendEventNotification({ ...command, recipients: 'all' });

    expect(await getRecipients()).toEqual(['goingId', 'notGoingId', 'otherId']);
  });
});
