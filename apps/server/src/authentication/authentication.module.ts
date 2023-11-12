import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EmailSenderPort } from '../infrastructure/email/email-sender.port';
import { EmailKind } from '../infrastructure/email/email.types';
import { EventsPort } from '../infrastructure/events/events.port';
import { AuthenticationLinkRequested } from '../members/events';
import { MembersFacade } from '../members/members.facade';
import { TOKENS } from '../tokens';

export class AuthenticationModule {
  static inject = injectableClass(this, TOKENS.events, TOKENS.emailSender, TOKENS.membersFacade);

  constructor(
    private readonly event: EventsPort,
    private readonly emailSender: EmailSenderPort,
    private readonly membersFacade: MembersFacade
  ) {}

  init() {
    this.event.addEventListener(AuthenticationLinkRequested, this.sendAuthenticationEmail.bind(this));
  }

  private async sendAuthenticationEmail(event: AuthenticationLinkRequested): Promise<void> {
    const member = await this.membersFacade.getMember(event.entityId);
    assert(member);

    await this.emailSender.send({
      to: member.email,
      subject: "SEL'ons-nous - Lien de connexion",
      kind: EmailKind.authentication,
      variables: {
        firstName: member.firstName,
        authenticationUrl: event.link,
      },
    });
  }
}
