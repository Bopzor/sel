import { waitFor } from '@sel/utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { Member } from '../members/member.entity';
import { TOKENS } from '../tokens';

import { Notification } from './notification.entity';

class Test extends E2ETest {
  member!: Member;

  async setup() {
    [this.member] = await this.createAuthenticatedMember({ email: 'member@localhost' });

    await this.application.registerDevice({
      memberId: this.member.id,
      deviceSubscription: 'subscription',
      deviceType: 'mobile',
    });
  }

  async notify(values: { push?: Notification['push']; email?: Notification['email'] }) {
    const subscriptionService = container.resolve(TOKENS.subscriptionService);

    await subscriptionService.notify({
      subscriptionType: 'NewAppVersion',
      notificationType: 'NewAppVersion',
      data: () => ({
        shouldSend: true,
        title: '',
        push: { title: '', content: '', link: '' },
        email: { subject: '', html: '', text: '' },
        ...values,
      }),
    });

    await this.waitForEventHandlers();
  }

  getPushNotification() {
    return this.pushNotification.notifications.get('subscription');
  }

  getEmails() {
    return this.mailServer.emails;
  }
}

describe('[E2E] Notification', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.create(Test);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('sends a push notification', async () => {
    await test.notify({
      push: { title: 'title', content: 'content', link: 'link' },
    });

    expect(test.getPushNotification()).toEqual([
      {
        title: 'title',
        content: 'content',
        link: 'link',
      },
    ]);

    expect(test.getEmails()).toHaveLength(0);
  });

  it('sends an email notification', async () => {
    await test.application.changeNotificationDeliveryType({
      memberId: test.member.id,
      notificationDeliveryType: { [NotificationDeliveryType.email]: true },
    });

    await test.application.registerDevice({
      memberId: test.member.id,
      deviceSubscription: 'subscription',
      deviceType: 'mobile',
    });

    await test.notify({
      email: { subject: 'subject', html: '', text: '' },
    });

    // email is sent asynchronously
    await waitFor(() => {
      const [email] = test.getEmails();

      expect(email, 'email notification was not sent').toBeDefined();
      expect(email).toHaveProperty('envelope.to.0.address', 'member@localhost');
      expect(email).toHaveProperty('subject', 'subject');
    });

    expect(test.pushNotification.notifications.get('subscription')).toBeUndefined();
  });
});
