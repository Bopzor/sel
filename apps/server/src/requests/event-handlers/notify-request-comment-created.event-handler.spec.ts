import { beforeEach, describe, expect, it } from 'vitest';

import { createComment } from '../../comments/comment.entity';
import { StubConfigAdapter } from '../../infrastructure/config/stub-config.adapter';
import { StubEmailRendererAdapter } from '../../infrastructure/email/stub-email-renderer.adapter';
import { FormatJsTranslationAdapter } from '../../infrastructure/translation/formatjs-translation.adapter';
import { createMember } from '../../members/member.entity';
import { NotificationTest } from '../../notification-test';
import { Notification } from '../../notifications/notification.entity';
import { createSubscription } from '../../notifications/subscription.entity';
import { InMemoryCommentRepository } from '../../persistence/repositories/comment/in-memory-comment.repository';
import { InMemoryRequestRepository } from '../../persistence/repositories/request/in-memory-request.repository';
import { RequestCommentCreated } from '../request-events';
import { createRequest } from '../request.entity';

import { NotifyRequestCommentCreated } from './notify-request-comment-created.event-handler';

const names = (name: string) => ({
  firstName: name,
  lastName: name,
});

class Test extends NotificationTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  translation = new FormatJsTranslationAdapter();
  commentRepository = new InMemoryCommentRepository();
  requestRepository = new InMemoryRequestRepository();
  emailRenderer = new StubEmailRendererAdapter();

  handler = new NotifyRequestCommentCreated(
    this.config,
    this.translation,
    this.memberRepository,
    this.commentRepository,
    this.requestRepository,
    this.subscriptionService,
    this.emailRenderer,
  );

  member = createMember({ id: 'memberId', ...names('Member') });
  requester = createMember({ id: 'requesterId', ...names('Requester') });
  author = createMember({ id: 'authorId', ...names('Author') });
  request = createRequest({ id: 'requestId', requesterId: 'requesterId', title: 'title' });
  comment = createComment({ id: 'commentId', authorId: 'authorId', text: 'comment' });

  event = new RequestCommentCreated('requestId', 'commentId', 'authorId');

  setup() {
    this.memberRepository.add(this.member);
    this.memberRepository.add(this.requester);
    this.memberRepository.add(this.author);

    this.requestRepository.add(this.request);
    this.commentRepository.add(this.comment);
  }

  createSubscription(memberId: string) {
    this.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId',
        type: 'RequestEvent',
        memberId,
        entityId: 'requestId',
        active: true,
      }),
    );
  }

  async execute() {
    await this.handler.handle(this.event);
  }
}

describe('NotifyRequestCommentCreated', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('to subscriber', async () => {
    test.createSubscription('memberId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Nouveau commentaire sur la demande "title"');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Nouveau commentaire sur la demande "title"',
      content: 'Author A. : comment',
      link: 'https://app.url/requests/requestId',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Commentaire de Author A. sur la demande "title"',
      html: [
        'Bonjour Member,',
        '<span class="strong">Author A.</span> a écrit un commentaire sur la demande <a href="https://app.url/requests/requestId">title</a> :',
        'comment',
      ].join('\n'),
      text: [
        'Bonjour Member,',
        'Author A. a écrit un commentaire sur la demande title :',
        '',
        'comment',
        '',
        'Lien de la demande concernée : https://app.url/requests/requestId',
      ].join('\n'),
    });
  });

  it('to requester', async () => {
    test.createSubscription('requesterId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Nouveau commentaire sur votre demande "title"');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Nouveau commentaire sur votre demande "title"',
      content: 'Author A. : comment',
      link: 'https://app.url/requests/requestId',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Commentaire de Author A. sur votre demande "title"',
      html: [
        'Bonjour Requester,',
        '<span class="strong">Author A.</span> a écrit un commentaire sur votre demande <a href="https://app.url/requests/requestId">title</a> :',
        'comment',
      ].join('\n'),
      text: [
        'Bonjour Requester,',
        'Author A. a écrit un commentaire sur votre demande title :',
        '',
        'comment',
        '',
        'Lien de la demande concernée : https://app.url/requests/requestId',
      ].join('\n'),
    });
  });

  it('to author', async () => {
    test.createSubscription('authorId');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });
});
