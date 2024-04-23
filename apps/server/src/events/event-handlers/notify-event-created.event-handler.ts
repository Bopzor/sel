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
import { EventCreated } from '../event-events';

export class NotifyEventCreated implements EventHandler<EventCreated> {
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

  async handle({ entityId: eventId }: EventCreated): Promise<void> {
    const event = await this.eventRepository.getEvent(eventId);
    assert(event);

    const organizer = await this.memberRepository.getMember(event.organizerId);
    assert(organizer);

    const organizerName = this.translation.memberName(organizer);
    const link = `${this.appBaseUrl}/events/${event.id}`;

    await this.subscriptionService.notify({
      subscriptionType: 'EventCreated',
      notificationType: 'EventCreated',
      notificationEntityId: event.id,

      data: (member) => ({
        shouldSend: member.id !== organizer.id,
        title: this.translation.translate('eventCreated.title'),
        push: {
          title: this.translation.translate('eventCreated.push.title'),
          content: event.title,
        },
        email: this.emailRenderer.render({
          subject: this.translation.translate('eventCreated.email.subject', { title: event.title }),
          html: [
            this.translation.translate('greeting', { firstName: member.firstName }),
            this.translation.translate('eventCreated.email.html.line1', {
              organizerName,
              title: event.title,
              link: (children) => `<a href="${link}">${children}</a>`,
            }),
            this.emailRenderer.userContent(event.html),
          ],
          text: [
            this.translation.translate('greeting', { firstName: member.firstName }),
            this.translation.translate('eventCreated.email.text.line1', {
              organizerName,
              title: event.title,
            }),
            '',
            event.text,
            '',
            this.translation.translate('eventCreated.email.text.line2', {
              link,
            }),
          ],
        }),
      }),
    });
  }
}
