import * as shared from '@sel/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { NotificationDeliveryType } from '../../common/notification-delivery-type';
import { container } from '../../container';
import { E2ETest } from '../../e2e-test';
import { Member } from '../../members/member.entity';
import { TOKENS } from '../../tokens';

class Test extends E2ETest {
  member!: Member;

  get notificationService() {
    return container.resolve(TOKENS.notificationService);
  }

  async setup(): Promise<void> {
    this.member = await this.create.member({ email: 'member@email', firstName: 'Member' });

    await this.application.changeNotificationDeliveryType({
      memberId: this.member.id,
      notificationDeliveryType: {
        [NotificationDeliveryType.push]: true,
        [NotificationDeliveryType.email]: true,
      },
    });

    await this.registerDevice(this.member, 'subscription');
  }

  async registerDevice(member: Member, subscription: string) {
    await this.application.registerDevice({
      memberId: member.id,
      deviceSubscription: subscription,
      deviceType: 'mobile',
    });
  }

  async assertNotificationSnapshot<Type extends shared.NotificationType>(
    type: Type,
    context: shared.NotificationData[Type],
  ) {
    await this.notificationService.notify([this.member.id], type, () => context);

    expect(this.logger.lines.error, this.logger.lines.error.join('\n')).toHaveLength(0);
    expect(this.pushNotification.notifications.get('"subscription"')).toMatchSnapshot();
    expect(this.emails).toMatchSnapshot();
  }

  private get emails() {
    return this.mailServer.emails.map((email) => ({
      to: email.to[0].address,
      subject: email.subject,
      text: email.text,
      html: email.html
        ?.replaceAll('\n', '')
        .replaceAll(/.*<!-- CONTENT START -->|<!-- CONTENT END -->.*/g, ''),
    }));
  }
}

describe('[intg] Notification snapshots', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.create(Test);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('Test', async () => {
    await test.assertNotificationSnapshot('Test', {
      member: { firstName: 'Member' },
      answer: 42,
      content: {
        html: '<p>hello <strong>world</strong></p>',
        text: 'hello world',
      },
    });
  });

  it('RequestCreated', async () => {
    await test.assertNotificationSnapshot('RequestCreated', {
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
    await test.assertNotificationSnapshot('RequestCommentCreated', {
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
    await test.assertNotificationSnapshot('RequestStatusChanged', {
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
});
