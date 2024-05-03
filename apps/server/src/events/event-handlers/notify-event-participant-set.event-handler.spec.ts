import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../../infrastructure/config/stub-config.adapter';
import { StubEmailRendererAdapter } from '../../infrastructure/email/stub-email-renderer.adapter';
import { FormatJsTranslationAdapter } from '../../infrastructure/translation/formatjs-translation.adapter';
import { createMember } from '../../members/member.entity';
import { NotificationTest } from '../../notification-test';
import { Notification } from '../../notifications/notification.entity';
import { createSubscription } from '../../notifications/subscription.entity';
import { InMemoryEventRepository } from '../../persistence/repositories/event/in-memory-event.repository';
import { EventParticipationSet } from '../event-events';
import { createEvent } from '../event.entity';

import { NotifyEventParticipationSet } from './notify-event-participant-set.event-handler';

const names = (name: string) => ({
  firstName: name,
  lastName: name,
});

class Test extends NotificationTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  translation = new FormatJsTranslationAdapter();
  eventRepository = new InMemoryEventRepository();
  emailRenderer = new StubEmailRendererAdapter();

  handler = new NotifyEventParticipationSet(
    this.config,
    this.translation,
    this.memberRepository,
    this.eventRepository,
    this.subscriptionService,
    this.emailRenderer,
  );

  member = createMember({ id: 'memberId', ...names('Member') });
  organizer = createMember({ id: 'organizerId', ...names('Organizer') });
  participant = createMember({ id: 'participantId', ...names('Participant') });

  event = createEvent({
    id: 'eventId',
    organizerId: 'organizerId',
    title: 'title',
  });

  eventEvent = new EventParticipationSet('eventId', 'participantId', null, null);

  setup() {
    this.memberRepository.add(this.member);
    this.memberRepository.add(this.organizer);
    this.memberRepository.add(this.participant);

    this.eventRepository.add(this.event);
  }

  createSubscription(memberId: string) {
    this.subscriptionRepository.add(
      createSubscription({
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

describe('[Unit] NotifyEventParticipationSet', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('to organizer, participation added', async () => {
    test.createSubscription('organizerId');
    test.eventEvent = new EventParticipationSet('eventId', 'participantId', null, 'yes');

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Participation à votre événement title');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Participation à votre événement title',
      content: 'Participant P. participera à votre événement.',
      link: 'https://app.url/events/eventId',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Participation à votre événement title',
      html: [
        'Bonjour Organizer,',
        '<span class="strong">Participant P.</span> participera à votre événement <a href="https://app.url/events/eventId">title</a>',
      ].join('\n'),
      text: [
        'Bonjour Organizer,',
        'Participant P. participera à votre événement title',
        "Lien de l'événement concerné : https://app.url/events/eventId",
      ].join('\n'),
    });
  });

  it('to organizer, participation removed', async () => {
    test.createSubscription('organizerId');
    test.eventEvent = new EventParticipationSet('eventId', 'participantId', 'yes', null);

    await test.execute();

    const notifications = test.notificationRepository.all();

    expect(notifications).toHaveProperty('0.title', 'Participation à votre événement title');

    expect(notifications).toHaveProperty<Notification['push']>('0.push', {
      title: 'Participation à votre événement title',
      content: 'Participant P. ne participera finalement pas à votre événement.',
      link: 'https://app.url/events/eventId',
    });

    expect(notifications).toHaveProperty<Notification['email']>('0.email', {
      subject: 'Participation à votre événement title',
      html: [
        'Bonjour Organizer,',
        '<span class="strong">Participant P.</span> ne participera finalement pas à votre événement <a href="https://app.url/events/eventId">title</a>',
      ].join('\n'),
      text: [
        'Bonjour Organizer,',
        'Participant P. ne participera finalement pas à votre événement title',
        "Lien de l'événement concerné : https://app.url/events/eventId",
      ].join('\n'),
    });
  });

  it('to organizer, participation set to no', async () => {
    test.createSubscription('organizerId');
    test.eventEvent = new EventParticipationSet('eventId', 'participantId', null, 'no');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });

  it('to subscriber', async () => {
    test.createSubscription('memberId');

    await test.execute();

    expect(test.notificationRepository.all()).toEqual([]);
  });
});
