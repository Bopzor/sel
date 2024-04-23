import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailRendererPort } from '../../infrastructure/email/email-renderer.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { CommentRepository } from '../../persistence/repositories/comment/comment.repository';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCommentCreated } from '../request-events';

export class NotifyRequestCommentCreated implements EventHandler<RequestCommentCreated> {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.commentRepository,
    TOKENS.requestRepository,
    TOKENS.subscriptionService,
    TOKENS.emailRenderer,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly commentRepository: CommentRepository,
    private readonly requestRepository: RequestRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly emailRenderer: EmailRendererPort,
  ) {}

  private get appBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  async handle(event: RequestCommentCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberRepository.getMember(request.requesterId);
    assert(requester);

    const comment = await this.commentRepository.getComment(event.commentId);
    assert(comment);

    const author = await this.memberRepository.getMember(comment.authorId);
    assert(author);

    const authorName = this.translation.memberName(author);
    const link = `${this.appBaseUrl}/requests/${request.id}`;

    await this.subscriptionService.notify({
      subscriptionType: 'RequestEvent',
      subscriptionEntityId: request.id,
      notificationType: 'RequestCommentCreated',
      notificationEntityId: request.id,

      data: (member) => {
        const t = this.translation;
        const isRequester = member.id === requester.id;

        return {
          shouldSend: member.id !== comment.authorId,

          title: t.translate('requestCommentCreated.title', {
            isRequester,
            title: request.title,
          }),

          push: {
            title: t.notificationTitle('requestCommentCreated.push.title', 'title', {
              isRequester,
              title: request.title,
            }),
            content: t.translate('requestCommentCreated.push.content', {
              authorName,
              message: comment.text,
            }),
          },

          email: this.emailRenderer.render({
            subject: t.translate('requestCommentCreated.email.subject', {
              isRequester,
              authorName,
              title: request.title,
            }),
            html: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('requestCommentCreated.email.html.line1', {
                isRequester,
                authorName,
                link: (children) => `<a href="${link}">${children}</a>`,
                title: request.title,
              }),
              // todo: comment.html
              this.emailRenderer.userContent(comment.text),
            ],
            text: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('requestCommentCreated.email.text.line1', {
                isRequester,
                authorName,
                title: request.title,
              }),
              '',
              comment.text,
              '',
              t.translate('requestCommentCreated.email.text.line2', {
                link,
                title: request.title,
              }),
            ],
          }),
        };
      },
    });
  }
}
