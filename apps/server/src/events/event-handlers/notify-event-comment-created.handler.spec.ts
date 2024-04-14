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
import { InMemoryEventRepository } from '../../persistence/repositories/event/in-memory-event.repository';
import { EventCommentCreated } from '../event-events';
import { createEvent } from '../event.entity';

import { NotifyEventCommentCreated } from './notify-event-comment-created.handler';

const names = (name: string) => ({
  firstName: name,
  lastName: name,
});

class Test extends NotificationTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  translation = new FormatJsTranslationAdapter();
  commentRepository = new InMemoryCommentRepository();
  eventRepository = new InMemoryEventRepository();
  emailRenderer = new StubEmailRendererAdapter();

  handler = new NotifyEventCommentCreated(
    this.config,
    this.translation,
    this.memberRepository,
    this.eventRepository,
    this.commentRepository,
    this.subscriptionService,
    this.emailRenderer,
  );

  member = createMember({ id: 'memberId', ...names('Member') });
  organizer = createMember({ id: 'organizerId', ...names('Organizer') });
  author = createMember({ id: 'authorId', ...names('Author') });
  event = createEvent({ id: 'eventId', organizerId: 'organizerId', title: 'title' });
  comment = createComment({ id: 'commentId', authorId: 'authorId', text: 'comment' });

  eventEvent = new EventCommentCreated('eventId', 'commentId', 'authorId');

  setup() {
    this.memberRepository.add(this.member);
    this.memberRepository.add(this.organizer);
    this.memberRepository.add(this.author);

    this.eventRepository.add(this.event);
    this.commentRepository.add(this.comment);
  }

  createSubscription(memberId: string) {
    this.subscriptionRepository.add(
      createSubscription({
        id: 'subscriptionId',
        type: 'EventEvent',
        memberId,
        entityId: 'eventId',
        active: true,
      }),
    );
  }

  async execute() {
    await this.handler.handle(this.eventEvent);
  }
}

describe('NotifyEventCommentCreated', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('to subscriber', async () => {
    test.createSubscription('memberId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Nouveau commentaire sur l\'événement "title"');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Nouveau commentaire sur l\'événement "title"',
      content: 'Author A. : comment',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Commentaire de Author A. sur l\'événement "title"',
      html: [
        'Bonjour Member,',
        '<span class="strong">Author A.</span> a écrit un commentaire sur l\'événement <a href="https://app.url/events/eventId">title</a> :',
        'comment',
      ].join('\n'),
      text: [
        'Bonjour Member,',
        "Author A. a écrit un commentaire sur l'événement title :",
        '',
        'comment',
        '',
        "Lien de l'événement concerné : https://app.url/events/eventId",
      ].join('\n'),
    });
  });

  it('to organizer', async () => {
    test.createSubscription('organizerId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Nouveau commentaire sur votre événement "title"');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Nouveau commentaire sur votre événement "title"',
      content: 'Author A. : comment',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Commentaire de Author A. sur votre événement "title"',
      html: [
        'Bonjour Organizer,',
        '<span class="strong">Author A.</span> a écrit un commentaire sur votre événement <a href="https://app.url/events/eventId">title</a> :',
        'comment',
      ].join('\n'),
      text: [
        'Bonjour Organizer,',
        'Author A. a écrit un commentaire sur votre événement title :',
        '',
        'comment',
        '',
        "Lien de l'événement concerné : https://app.url/events/eventId",
      ].join('\n'),
    });
  });

  it('to author', async () => {
    test.createSubscription('authorId');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });
});
