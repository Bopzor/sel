import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailRendererPort } from '../../infrastructure/email/email-renderer.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { EventRepository } from '../../persistence/repositories/event/event.repository';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { EventParticipationSet } from '../event-events';

export class NotifyEventParticipationSet implements EventHandler<EventParticipationSet> {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.eventRepository,
    TOKENS.subscriptionService,
    TOKENS.emailRenderer,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly eventRepository: EventRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly emailRenderer: EmailRendererPort,
  ) {}

  private get appBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  async handle({
    entityId: eventId,
    participantId,
    previousParticipation,
    participation,
  }: EventParticipationSet): Promise<void> {
    const event = await this.eventRepository.getEvent(eventId);
    assert(event);

    const organizer = await this.memberRepository.getMember(event.organizerId);
    assert(organizer);

    const participant = await this.memberRepository.getMember(participantId);
    assert(participant);

    const participantName = this.translation.memberName(participant);
    const addedOrRemoved = participation === 'yes' ? 'added' : 'removed';

    const title = event.title;
    const link = `${this.appBaseUrl}/events/${event.id}`;

    await this.subscriptionService.notify({
      subscriptionType: 'EventEvent',
      subscriptionEntityId: event.id,
      notificationType: 'EventParticipationSet',
      notificationEntityId: event.id,

      data: (member) => {
        const t = this.translation;

        return {
          get shouldSend(): boolean {
            if (member.id !== organizer.id || participant.id === organizer.id) {
              return false;
            }

            return participation === 'yes' || previousParticipation === 'yes';
          },
          title: t.translate('eventParticipationSet.title', { title }),
          push: {
            title: t.translate('eventParticipationSet.push.title', { title }),
            content: t.translate(`eventParticipationSet.push.content.${addedOrRemoved}`, { participantName }),
          },
          email: this.emailRenderer.render({
            subject: t.translate('eventParticipationSet.email.subject', { participantName, title }),
            html: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate(`eventParticipationSet.email.html.line1.${addedOrRemoved}`, {
                participantName,
                title,
                link: t.link(link),
              }),
            ],
            text: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate(`eventParticipationSet.email.text.line1.${addedOrRemoved}`, {
                participantName,
                title,
              }),
              t.translate('eventParticipationSet.email.text.line2', {
                title,
                link,
              }),
            ],
          }),
        };
      },
    });
  }
}
