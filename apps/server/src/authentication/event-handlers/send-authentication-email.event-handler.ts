import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailRendererPort } from '../../infrastructure/email/email-renderer.port';
import { EmailSenderPort } from '../../infrastructure/email/email-sender.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { AuthenticationLinkRequested } from '../../members/member-events';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export class SendAuthenticationEmail implements EventHandler<AuthenticationLinkRequested> {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.emailSender,
    TOKENS.emailRenderer,
    TOKENS.memberRepository,
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly emailSender: EmailSenderPort,
    private readonly emailRenderer: EmailRendererPort,
    private readonly memberRepository: MemberRepository,
  ) {}

  async handle(event: AuthenticationLinkRequested): Promise<void> {
    const member = await this.memberRepository.getMember(event.entityId);
    assert(member);

    await this.emailSender.send({
      to: member.email,
      ...this.emailRenderer.render({
        subject: this.translation.translate('authenticationLink.subject'),
        html: [
          this.translation.translate('greeting', { firstName: member.firstName }),
          this.translation.translate('authenticationLink.html.line1', {
            link: this.translation.link(event.link),
            authenticationUrl: event.link,
          }),
          this.translation.translate('authenticationLink.line2'),
        ],
        text: [
          this.translation.translate('greeting', { firstName: member.firstName }),
          this.translation.translate('authenticationLink.text.line1', { authenticationUrl: event.link }),
          this.translation.translate('authenticationLink.line2'),
        ],
      }),
    });
  }
}
