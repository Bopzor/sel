import { beforeEach, describe, expect, it } from 'vitest';

import { EventBus } from '../infrastructure/cqs/event-bus';
import { Email, EmailKind } from '../infrastructure/email/email.types';
import { StubEmailSenderAdapter } from '../infrastructure/email/stub-email-sender.adapter';
import { createMember } from '../members/entities';
import { AuthenticationLinkRequested } from '../members/events';
import { StubMembersFacade } from '../members/members.facade';
import { UnitTest } from '../unit-test';

import { AuthenticationModule } from './authentication.module';

class Test extends UnitTest {
  eventBus = new EventBus();
  emailSender = new StubEmailSenderAdapter();
  membersFacade = new StubMembersFacade();

  module = new AuthenticationModule(this.eventBus, this.emailSender, this.membersFacade);

  member = createMember({ id: 'memberId', email: 'email', firstName: 'firstName' });

  setup(): void {
    this.module.init();
    this.membersFacade.members.push(this.member);
  }
}

describe('AuthenticationModule', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('sends an authentication email when a request authentication link domain event is triggered', async () => {
    // todo: test without eventBus
    test.eventBus.publish(new AuthenticationLinkRequested('memberId', 'link'));
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(test.emailSender.emails).toContainEqual<Email>({
      to: 'email',
      // cspell:disable-next-line
      subject: "SEL'ons-nous - Lien de connexion",
      kind: EmailKind.authentication,
      variables: {
        firstName: 'firstName',
        authenticationUrl: 'link',
      },
    });
  });
});
