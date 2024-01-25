import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { UnitTest } from '../../unit-test';
import { MemberCreated } from '../member-events';

import { CreateMember } from './create-member.command';

class Test extends UnitTest {
  eventPublisher = new StubEventPublisher();
  membersRepository = new InMemoryMemberRepository();

  handler = new CreateMember(this.membersRepository, this.eventPublisher);
}

describe('[Unit] CreateMember', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('creates a new member', async () => {
    await test.handler.handle({
      memberId: 'memberId',
      firstName: 'Toto',
      lastName: 'Tata',
      email: 'email',
    });

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('id', 'memberId');
    expect(member).toHaveProperty('firstName', 'Toto');
    expect(member).toHaveProperty('lastName', 'Tata');
    expect(member).toHaveProperty('email', 'email');
  });

  it('emits a MemberCreated domain event', async () => {
    await test.handler.handle({
      memberId: 'memberId',
      firstName: '',
      lastName: '',
      email: '',
    });

    expect(test.eventPublisher).toHaveEmitted(new MemberCreated('memberId'));
  });
});
