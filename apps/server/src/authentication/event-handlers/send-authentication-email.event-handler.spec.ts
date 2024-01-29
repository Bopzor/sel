import { beforeEach, describe, expect, it } from 'vitest';

import { Email } from '../../infrastructure/email/email.types';
import { StubEmailSenderAdapter } from '../../infrastructure/email/stub-email-sender.adapter';
import { AuthenticationLinkRequested } from '../../members/member-events';
import { createMember } from '../../members/member.entity';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { UnitTest } from '../../unit-test';

import { SendAuthenticationEmail } from './send-authentication-email.event-handler';

class Test extends UnitTest {
  emailSender = new StubEmailSenderAdapter();
  memberRepository = new InMemoryMemberRepository();

  handler = new SendAuthenticationEmail(this.emailSender, this.memberRepository);

  member = createMember({ id: 'memberId', email: 'email', firstName: 'firstName' });

  setup(): void {
    this.memberRepository.add(this.member);
  }
}

describe('AuthenticationModule', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('sends an authentication email when a request authentication link domain event is triggered', async () => {
    await test.handler.handle(new AuthenticationLinkRequested('memberId', 'link'));

    expect(test.emailSender.emails).toContainEqual<Email>({
      to: 'email',
      kind: 'authentication',
      variables: {
        firstName: 'firstName',
        authenticationUrl: 'link',
      },
    });
  });
});
