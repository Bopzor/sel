import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../../infrastructure/config/stub-config.adapter';
import { StubEmailRendererAdapter } from '../../infrastructure/email/stub-email-renderer.adapter';
import { FormatJsTranslationAdapter } from '../../infrastructure/translation/formatjs-translation.adapter';
import { createMember } from '../../members/member.entity';
import { NotificationTest } from '../../notification-test';
import { Notification } from '../../notifications/notification.entity';
import { createSubscription } from '../../notifications/subscription.entity';
import { InMemoryEventRepository } from '../../persistence/repositories/event/in-memory-event.repository';
import { EventCreated } from '../event-events';
import { createEvent } from '../event.entity';

import { NotifyEventCreated } from './notify-event-created.event-handler';

const names = (name: string) => ({
  firstName: name,
  lastName: name,
});

class Test extends NotificationTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  translation = new FormatJsTranslationAdapter();
  eventRepository = new InMemoryEventRepository();
  emailRenderer = new StubEmailRendererAdapter();

  handler = new NotifyEventCreated(
    this.config,
    this.translation,
    this.memberRepository,
    this.eventRepository,
    this.subscriptionService,
    this.emailRenderer,
  );

  member = createMember({ id: 'memberId', ...names('Member') });
  organizer = createMember({ id: 'organizerId', ...names('Organizer') });

  event = createEvent({
    id: 'eventId',
    organizerId: 'organizerId',
    title: 'title',
    text: 'text',
    html: '<p>html</p>',
  });

  eventEvent = new EventCreated('eventId', 'organizerId');

  setup() {
    this.memberRepository.add(this.member);
    this.memberRepository.add(this.organizer);

    this.eventRepository.add(this.event);
  }

  createSubscription(memberId: string) {
    this.subscriptionRepository.add(
      createSubscription({
        type: 'EventCreated',
        memberId,
        active: true,
      }),
    );
  }

  async execute() {
    await this.handler.handle(this.eventEvent);
  }
}

describe('NotifyEventCreated', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('to subscriber', async () => {
    test.createSubscription('memberId');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Nouvel événement');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Nouvel événement',
      content: 'title',
      link: 'https://app.url/events/eventId',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Nouvel événement : title',
      html: [
        'Bonjour Member,',
        '<span class="strong">Organizer O.</span> a créé un nouvel événement : <a href="https://app.url/events/eventId">title</a>',
        '<p>html</p>',
      ].join('\n'),
      text: [
        'Bonjour Member,',
        'Organizer O. a créé un nouvel événement : title',
        '',
        'text',
        '',
        "Lien de l'événement : https://app.url/events/eventId",
      ].join('\n'),
    });
  });

  it('to organizer', async () => {
    test.createSubscription('organizerId');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });
});
