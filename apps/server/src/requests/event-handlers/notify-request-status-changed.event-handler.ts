import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { ConfigPort } from '../../infrastructure/config/config.port';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailRendererPort } from '../../infrastructure/email/email-renderer.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCanceled, RequestFulfilled } from '../request-events';

export class NotifyRequestStatusChanged implements EventHandler<RequestFulfilled | RequestCanceled> {
  static inject = injectableClass(
    this,
    TOKENS.config,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.requestRepository,
    TOKENS.subscriptionService,
    TOKENS.emailRenderer,
  );

  constructor(
    private readonly config: ConfigPort,
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly requestRepository: RequestRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly emailRenderer: EmailRendererPort,
  ) {}

  private get appBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  async handle(event: RequestFulfilled | RequestCanceled): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberRepository.getMember(request.requesterId);
    assert(requester);

    const t = this.translation;

    const title = request.title;
    const requesterName = t.memberName(requester);

    const link = `${this.appBaseUrl}/requests/${request.id}`;

    await this.subscriptionService.notify({
      subscriptionType: 'RequestEvent',
      subscriptionEntityId: request.id,
      notificationType: 'RequestStatusChanged',
      notificationEntityId: request.id,

      data: (member) => {
        return {
          shouldSend: member.id !== requester.id,
          title: t.translate('requestStatusChanged.title', { requesterName }),
          push: {
            title: t.translate('requestStatusChanged.push.title', { requesterName }),
            content: title,
            link,
          },
          email: this.emailRenderer.render({
            subject: t.translate('requestStatusChanged.email.subject', { requesterName, title }),
            html: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('requestStatusChanged.email.html.line1', {
                requesterName,
                title,
                link: t.link(link),
              }),
            ],
            text: [
              t.translate('greeting', { firstName: member.firstName }),
              t.translate('requestStatusChanged.email.text.line1', { requesterName, title }),
              t.translate('requestStatusChanged.email.text.line2', { link }),
            ],
          }),
        };
      },
    });
  }
}
