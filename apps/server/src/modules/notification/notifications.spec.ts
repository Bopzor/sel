import * as shared from '@sel/shared';
import { defined, waitFor } from '@sel/utils';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEmailSender } from 'src/infrastructure/email';
import { StubLogger } from 'src/infrastructure/logger';
import { StubPushNotification } from 'src/infrastructure/push-notification';
import { db, resetDatabase } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { Member, updateMember } from '../member';

import { notify } from './domain/notify';
import { registerDevice } from './domain/register-device.command';
import { NotificationDeliveryType } from './notification.entities';

describe('notification snapshots', () => {
  let member: Member;
  let subscription: string;

  beforeAll(async () => {
    await resetDatabase();

    await persist.member({ email: 'member@email' });
    member = defined(await db.query.members.findFirst());
    subscription = 'subscription';

    await updateMember(member.id, {
      notificationDelivery: [NotificationDeliveryType.push, NotificationDeliveryType.email],
    });

    await registerDevice({
      memberId: member.id,
      deviceSubscription: subscription,
      deviceType: 'mobile',
    });
  });

  let logger: StubLogger;
  let pushNotification: StubPushNotification;
  let emailSender: StubEmailSender;

  beforeEach(async () => {
    logger = new StubLogger();
    pushNotification = new StubPushNotification();
    emailSender = new StubEmailSender();

    container.bindValue(TOKENS.logger, logger);
    container.bindValue(TOKENS.pushNotification, pushNotification);
    container.bindValue(TOKENS.emailSender, emailSender);
  });

  async function assertNotificationSnapshot<Type extends shared.NotificationType>(
    type: Type,
    context: shared.NotificationData[Type],
  ) {
    await notify([member.id], type, () => context);

    expect(logger.lines.error, logger.lines.error.join('\n')).toHaveLength(0);
    expect(pushNotification.notifications.get('"subscription"')).toMatchSnapshot();
    expect(await getEmails()).toMatchSnapshot();
  }

  async function getEmails() {
    await waitFor(() => {
      if (emailSender.emails.length === 0) {
        throw new Error('No emails sent');
      }
    });

    return emailSender.emails.map((email) => ({
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html
        ?.replaceAll('\n', '')
        .replaceAll(/.*<!-- CONTENT START -->|<!-- CONTENT END -->.*/g, ''),
    }));
  }

  it('Test', async () => {
    await assertNotificationSnapshot('Test', {
      member: { firstName: 'Member' },
      answer: 42,
      content: {
        html: '<p>hello <strong>world</strong></p>',
        text: 'hello world',
      },
    });
  });

  it('RequestCreated', async () => {
    await assertNotificationSnapshot('RequestCreated', {
      member: { firstName: 'Member' },
      request: {
        id: 'requestId',
        title: 'Request title',
        requester: {
          id: 'requesterId',
          name: 'Requester',
        },
        body: {
          html: '<p>Request body</p>',
          text: 'Request body',
        },
      },
    });
  });

  it('RequestCommentCreated', async () => {
    await assertNotificationSnapshot('RequestCommentCreated', {
      member: { firstName: 'Member' },
      isRequester: true,
      request: {
        id: 'requestId',
        title: 'Request title',
        requester: {
          id: 'requesterId',
          name: 'Requester',
        },
      },
      comment: {
        id: 'commentId',
        author: {
          id: 'authorId',
          name: 'Author',
        },
        body: {
          html: '<p>Comment body</p>',
          text: 'Comment body',
        },
      },
    });
  });

  it('RequestStatusChanged', async () => {
    await assertNotificationSnapshot('RequestStatusChanged', {
      member: { firstName: 'Member' },
      request: {
        id: 'requestId',
        title: 'Request title',
        status: shared.RequestStatus.canceled,
        requester: {
          id: 'requesterId',
          name: 'Requester',
        },
      },
    });
  });

  it('EventCreated', async () => {
    await assertNotificationSnapshot('EventCreated', {
      member: { firstName: 'Member' },
      event: {
        id: 'eventId',
        title: 'Event title',
        organizer: {
          id: 'organizerId',
          name: 'Organizer',
        },
        body: {
          html: '<p>Event body</p>',
          text: 'Event body',
        },
      },
    });
  });

  it('EventCommentCreated', async () => {
    await assertNotificationSnapshot('EventCommentCreated', {
      member: { firstName: 'Member' },
      isOrganizer: true,
      event: {
        id: 'eventId',
        title: 'Event title',
        organizer: {
          id: 'organizerId',
          name: 'Organizer',
        },
      },
      comment: {
        id: 'commentId',
        author: {
          id: 'authorId',
          name: 'Author',
        },
        body: {
          html: '<p>Comment body</p>',
          text: 'Comment body',
        },
      },
    });
  });

  it('EventParticipationSet', async () => {
    await assertNotificationSnapshot('EventParticipationSet', {
      member: { firstName: 'Member' },
      event: {
        id: 'eventId',
        title: 'Event title',
        organizer: {
          id: 'organizerId',
        },
      },
      participant: {
        id: 'participantId',
        name: 'Participant',
      },
      participation: 'yes',
      previousParticipation: null,
    });
  });

  it('TransactionPending', async () => {
    await assertNotificationSnapshot('TransactionPending', {
      member: { firstName: 'Member' },
      transaction: {
        id: 'transactionId',
        description: 'Transaction description',
        recipient: {
          id: 'recipientId',
          name: 'Recipient',
        },
      },
      currency: 'coins',
      currencyAmount: '123 coins',
    });
  });

  it('TransactionCompleted', async () => {
    await assertNotificationSnapshot('TransactionCompleted', {
      member: { firstName: 'Member' },
      transaction: {
        id: 'transactionId',
        description: 'Transaction description',
        payer: {
          id: 'payerId',
          name: 'Payer',
        },
      },
      currencyAmount: '123 coins',
    });
  });

  it('TransactionCanceled', async () => {
    await assertNotificationSnapshot('TransactionCanceled', {
      member: { firstName: 'Member' },
      transaction: {
        id: 'transactionId',
        description: 'Transaction description',
        payer: {
          id: 'payerId',
          name: 'Payer',
        },
      },
      currency: 'coins',
    });
  });
});
