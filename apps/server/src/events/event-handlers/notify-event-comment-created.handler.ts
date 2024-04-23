import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailRendererPort } from '../../infrastructure/email/email-renderer.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { CommentRepository } from '../../persistence/repositories/comment/comment.repository';
import { EventRepository } from '../../persistence/repositories/event/event.repository';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';
import { EventCommentCreated } from '../event-events';

export class NotifyEventCommentCreated implements EventHandler<EventCommentCreated> {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.eventRepository,
    TOKENS.commentRepository,
    TOKENS.subscriptionService,
    TOKENS.emailRenderer,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly eventRepository: EventRepository,
    private readonly commentRepository: CommentRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly emailRenderer: EmailRendererPort,
  ) {}

  private get appBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  async handle({ entityId: eventId, commentId }: EventCommentCreated): Promise<void> {
    const event = await this.eventRepository.getEvent(eventId);
    assert(event);

    const organizer = await this.memberRepository.getMember(event.organizerId);
    assert(organizer);

    const comment = await this.commentRepository.getComment(commentId);
    assert(comment);

    const author = await this.memberRepository.getMember(comment.authorId);
    assert(author);

    const link = `${this.appBaseUrl}/events/${event.id}`;

    await this.subscriptionService.notify({
      subscriptionType: 'EventEvent',
      subscriptionEntityId: event.id,
      notificationType: 'EventCommentCreated',
      notificationEntityId: event.id,

      data: (member) => {
        const isOrganizer = member.id === organizer.id;
        const authorName = this.translation.memberName(author);
        const title = event.title;
        const message = comment.text;

        return {
          shouldSend: member.id !== author.id,

          title: this.translation.translate('eventCommentCreated.title', {
            isOrganizer,
            title,
          }),

          push: {
            title: this.translation.notificationTitle('eventCommentCreated.push.title', 'title', {
              isOrganizer,
              title,
            }),
            content: this.translation.translate('eventCommentCreated.push.content', {
              authorName,
              message,
            }),
          },

          email: this.emailRenderer.render({
            subject: this.translation.translate('eventCommentCreated.email.subject', {
              isOrganizer,
              authorName,
              title,
            }),
            html: [
              this.translation.translate('greeting', { firstName: member.firstName }),
              this.translation.translate('eventCommentCreated.email.html.line1', {
                isOrganizer,
                authorName,
                link: (children) => `<a href="${link}">${children}</a>`,
                title,
              }),
              // todo: comment.html
              this.emailRenderer.userContent(comment.text),
            ],
            text: [
              this.translation.translate('greeting', { firstName: member.firstName }),
              this.translation.translate('eventCommentCreated.email.text.line1', {
                isOrganizer,
                authorName,
                title,
              }),
              '',
              comment.text,
              '',
              this.translation.translate('eventCommentCreated.email.text.line2', {
                link,
                title,
              }),
            ],
          }),
        };
      },
    });
  }
}
