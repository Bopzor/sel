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

import { NotifyRequestCreated } from './notify-request-created.event-handler';

const names = (name: string) => ({
  firstName: name,
  lastName: name,
});

class Test extends NotificationTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  translation = new FormatJsTranslationAdapter();
  requestRepository = new InMemoryRequestRepository();
  emailRenderer = new StubEmailRendererAdapter();

  handler = new NotifyRequestCreated(
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
        type: 'RequestCreated',
        memberId,
        active: true,
      }),
    );
  }

  async execute() {
    await this.handler.handle(this.requestRequest);
  }
}

describe('[Unit] NotifyRequestCreated', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('to subscriber', async () => {
    test.createSubscription('memberId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Demande de Requester R.');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Demande de Requester R.',
      content: 'title',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Demande de Requester R. : title',
      html: [
        'Bonjour Member,',
        '<span class="strong">Requester R.</span> a publié une nouvelle demande : <a href="https://app.url/requests/requestId">title</a>',
        '<p>html</p>',
      ].join('\n'),
      text: [
        'Bonjour Member,',
        'Requester R. a publié une nouvelle demande : title',
        '',
        'text',
        '',
        'Lien de la demande : https://app.url/requests/requestId',
      ].join('\n'),
    });
  });

  it('to requester', async () => {
    test.createSubscription('requesterId');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });
});
