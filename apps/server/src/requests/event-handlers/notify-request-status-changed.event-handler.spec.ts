import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../../infrastructure/config/stub-config.adapter';
import { StubEmailRendererAdapter } from '../../infrastructure/email/stub-email-renderer.adapter';
import { FormatJsTranslationAdapter } from '../../infrastructure/translation/formatjs-translation.adapter';
import { createMember } from '../../members/member.entity';
import { NotificationTest } from '../../notification-test';
import { Notification } from '../../notifications/notification.entity';
import { createSubscription } from '../../notifications/subscription.entity';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { RequestCreated } from '../request-events';
import { createRequest } from '../request.entity';

import { NotifyRequestStatusChanged } from './notify-request-status-changed.event-handler';

const names = (name: string) => ({
  firstName: name,
  lastName: name,
});

class Test extends NotificationTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  translation = new FormatJsTranslationAdapter();
  requestRepository = new InMemoryRequestRepository();
  emailRenderer = new StubEmailRendererAdapter();

  handler = new NotifyRequestStatusChanged(
    this.config,
    this.translation,
    this.memberRepository,
    this.requestRepository,
    this.subscriptionService,
    this.emailRenderer,
  );

  member = createMember({ id: 'memberId', ...names('Member') });
  requester = createMember({ id: 'requesterId', ...names('Requester') });

  request = createRequest({
    id: 'requestId',
    requesterId: 'requesterId',
    title: 'title',
    body: {
      text: 'text',
      html: '<p>html</p>',
    },
  });

  requestRequest = new RequestCreated('requestId', 'requesterId');

  setup() {
    this.memberRepository.add(this.member);
    this.memberRepository.add(this.requester);

    this.requestRepository.add(this.request);
  }

  createSubscription(memberId: string) {
    this.subscriptionRepository.add(
      createSubscription({
        type: 'RequestEvent',
        memberId,
        entityId: 'requestId',
        active: true,
      }),
    );
  }

  async execute() {
    await this.handler.handle(this.requestRequest);
  }
}

describe('[Unit] NotifyRequestStatusCreated', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('to subscriber', async () => {
    test.createSubscription('memberId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Requester R. a annulé sa demande');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Requester R. a annulé sa demande',
      content: 'title',
      link: 'https://app.url/requests/requestId',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Requester R. a annulé sa demande "title"',
      html: [
        'Bonjour Member,',
        '<span class="strong">Requester R.</span> a annulé sa demande "<a href="https://app.url/requests/requestId">title</a>"',
      ].join('\n'),
      text: [
        'Bonjour Member,',
        'Requester R. a annulé sa demande title',
        'Lien de la demande concernée : https://app.url/requests/requestId',
      ].join('\n'),
    });
  });

  it('to requester', async () => {
    test.createSubscription('requesterId');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });
});
