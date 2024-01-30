import { waitFor } from '@sel/utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { E2ETest } from '../e2e-test';
import { ChangeNotificationDeliveryTypeCommand } from '../members/commands/change-notification-delivery-type.command';
import { Member } from '../members/member.entity';
import { COMMANDS } from '../tokens';

class Test extends E2ETest {
  member!: Member;

  async setup() {
    this.member = await this.create.member({ email: 'member@localhost' });

    await this.application.registerDevice({
      memberId: this.member.id,
      deviceSubscription: 'subscription',
      deviceType: 'mobile',
    });
  }

  async changeNotificationDeliveryType(
    notificationDeliveryType: ChangeNotificationDeliveryTypeCommand['notificationDeliveryType']
  ) {
    await this.application.changeNotificationDeliveryType({
      memberId: this.member.id,
      notificationDeliveryType,
    });
  }

  async notify() {
    await this.application.notify({
      subscriptionType: 'NewAppVersion',
      notificationType: 'NewAppVersion',
      data: { version: '' },
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
    await test.changeNotificationDeliveryType({ [NotificationDeliveryType.push]: true });

    await test.notify();

    expect(test.getPushNotification()).toEqual({
      title: "Nouvelle version de l'app",
      content: "Une nouvelle version de l'app est disponible.",
    });

    expect(test.getEmails()).toHaveLength(0);
  });

  it('sends an email notification', async () => {
    await test.changeNotificationDeliveryType({ [NotificationDeliveryType.email]: true });

    await test.application.registerDevice({
      memberId: test.member.id,
      deviceSubscription: 'subscription',
      deviceType: 'mobile',
    });

    await test.notify();

    // email is sent asynchronously
    await waitFor(() => {
      const [email] = test.getEmails();

      expect(email).toHaveProperty('envelope.to.0.address', 'member@localhost');
      expect(email).toHaveProperty('subject', "SEL'ons-nous - Nouvelle version de l'app");
    });

    expect(test.pushNotification.notifications.get('subscription')).toBeUndefined();
  });
});
