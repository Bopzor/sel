import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { EmailSenderPort } from '../../infrastructure/email/email-sender.port';
import { AuthenticationLinkRequested } from '../../members/member-events';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { TOKENS } from '../../tokens';

export class SendAuthenticationEmail implements EventHandler<AuthenticationLinkRequested> {
  static inject = injectableClass(this, TOKENS.emailSender, TOKENS.memberRepository);

  constructor(
    private readonly emailSender: EmailSenderPort,
    private readonly memberRepository: MemberRepository,
  ) {}

  async handle(event: AuthenticationLinkRequested): Promise<void> {
    const member = await this.memberRepository.getMember(event.entityId);
    assert(member);

    await this.emailSender.send({
      to: member.email,
      kind: 'authentication',
      variables: {
        firstName: member.firstName,
        authenticationUrl: event.link,
      },
    });
  }
}
