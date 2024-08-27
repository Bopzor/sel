import util from 'node:util';

import { hasProperty } from '@sel/utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { Member } from '../members/member.entity';
import { TOKENS } from '../tokens';

class Test extends E2ETest {
  member1!: Member;
  member2!: Member;

  get notificationService() {
    return container.resolve(TOKENS.notificationService);
  }

  async setup(): Promise<void> {
    this.member1 = await this.create.member({ email: 'member1@email', firstName: 'Member 1' });
    this.member2 = await this.create.member({ email: 'member2@email', firstName: 'Member 2' });
  }

  async changeNotificationDeliveryType(member: Member, deliveryTypes: NotificationDeliveryType[]) {
    const notificationDeliveryType = {
      [NotificationDeliveryType.push]: deliveryTypes.includes(NotificationDeliveryType.push),
      [NotificationDeliveryType.email]: deliveryTypes.includes(NotificationDeliveryType.email),
    };

    await this.application.changeNotificationDeliveryType({
      memberId: member.id,
      notificationDeliveryType,
    });
  }

  async registerDevice(member: Member, subscription: string) {
    await this.application.registerDevice({
      memberId: member.id,
      deviceSubscription: subscription,
      deviceType: 'mobile',
    });
  }
}

describe('[intg] NotificationService', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.create(Test);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('sends notifications to all members without errors', async () => {
    const { member1, member2 } = test;

    await test.changeNotificationDeliveryType(member1, [
      NotificationDeliveryType.email,
      NotificationDeliveryType.push,
    ]);

    await test.changeNotificationDeliveryType(member2, [NotificationDeliveryType.push]);

    await test.registerDevice(member1, 'subscription1');
    await test.registerDevice(member2, 'subscription2');
    await test.registerDevice(member2, 'subscription3');

    await test.notificationService.notify(null, 'Test', (member) => ({
      member: { firstName: member.firstName },
      answer: 42,
      link: test.config.app.baseUrl,
      content: { html: '<p>some content</p>', text: 'some content' },
    }));

    const db = container.resolve(TOKENS.database).db;
    const notifications = await db.query.notifications2.findMany();
    const deliveries = await db.query.notificationDeliveries.findMany();

    const errors = test.logger.lines.error;
    expect(errors, errors.map((value) => util.inspect(value)).join('\n')).toHaveLength(0);

    expect(notifications).toHaveLength(2);
    expect(deliveries).toHaveLength(4);
    expect(deliveries.every((delivery) => delivery.delivered)).toEqual(true);

    expect(test.pushNotification.notifications.size).toEqual(3);

    expect(test.pushNotification.notifications.get(JSON.stringify('subscription1'))).toContainEqual({
      title: 'Test notification (push)',
      content: 'Hello Member 1, this is a test notification! I hope it works 😄',
      link: 'http://app.url',
    });

    expect(test.mailServer.emails).toEqual([
      expect.objectContaining({
        from: [expect.objectContaining({ address: 'sel@localhost' })],
        to: [expect.objectContaining({ address: 'member1@email' })],
        subject: 'Test notification (email)',
        html: expect.stringContaining('Hello Member 1, this is <strong>a test notification</strong>!'),
        text: expect.stringContaining('Hello Member 1, this is a test notification!'),
      }),
    ]);

    expect(test.mailServer.emails).toHaveProperty(
      '0.text',
      `Hello Member 1, this is a test notification! I hope it works 😄

Here is a link (http://app.url).

42 is a good answer.

And here is some verbatim content:

some content

Cheers!`,
    );
  });

  it('logs and stores errors', async () => {
    const { member1, member2 } = test;

    for (const member of [member1, member2]) {
      await test.changeNotificationDeliveryType(member, [
        NotificationDeliveryType.email,
        NotificationDeliveryType.push,
      ]);
    }

    await test.registerDevice(member1, 'subscription1');
    await test.registerDevice(member2, 'subscription2');
    await test.registerDevice(member2, 'subscription3');

    const error = new Error('Oops');

    test.pushNotification.errors.set(JSON.stringify('subscription1'), error);

    await test.notificationService.notify(null, 'Test', (member) => ({
      member: { firstName: member.firstName },
      answer: 42,
      link: test.config.app.baseUrl,
      content: { html: '<p>some content</p>', text: 'some content' },
    }));

    const db = container.resolve(TOKENS.database).db;
    const deliveries = await db.query.notificationDeliveries.findMany();

    const failedDelivery = deliveries.find(hasProperty('target', JSON.stringify('subscription1')));
    const successDeliveries = deliveries.filter((delivery) => delivery !== failedDelivery);

    expect(successDeliveries.every((delivery) => delivery.delivered)).toEqual(true);
    expect(failedDelivery).toHaveProperty('delivered', false);
    expect(failedDelivery).toHaveProperty('error.message', error.message);
    expect(failedDelivery).toHaveProperty('error.stack', error.stack);
  });
});
