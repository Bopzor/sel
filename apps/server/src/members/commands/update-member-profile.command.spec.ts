import { UpdateMemberProfileData } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { UnitTest } from '../../unit-test';
import { MemberStatus, createMember } from '../member.entity';
import { OnboardingCompleted } from '../member-events';

import { UpdateMemberProfile, UpdateMemberProfileCommand } from './update-member-profile.command';

class Test extends UnitTest {
  createUpdateMemberProfileData = createFactory<UpdateMemberProfileData>(() => ({
    firstName: '',
    lastName: '',
    emailVisible: true,
    phoneNumbers: [],
  }));

  eventPublisher = new StubEventPublisher();
  membersRepository = new InMemoryMemberRepository();

  handler = new UpdateMemberProfile(this.membersRepository, this.eventPublisher);

  command: UpdateMemberProfileCommand = {
    memberId: 'memberId',
    data: this.createUpdateMemberProfileData(),
  };

  async execute() {
    await this.handler.handle(this.command);
  }
}

describe('[Unit] UpdateMemberProfile', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it("updates a member's profile information", async () => {
    test.membersRepository.add(createMember({ id: 'memberId', firstName: 'Toto' }));

    test.command.data.firstName = 'Tata';
    await test.execute();

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('firstName', 'Tata');
  });

  it("sets a member's onboarding as completed", async () => {
    test.membersRepository.add(createMember({ id: 'memberId', status: MemberStatus.onboarding }));

    test.command.data.onboardingCompleted = true;
    await test.execute();

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('status', MemberStatus.active);
  });

  it('triggers an OnboardingCompleted domain event', async () => {
    test.membersRepository.add(createMember({ id: 'memberId', status: MemberStatus.onboarding }));

    test.command.data.onboardingCompleted = true;
    await test.execute();

    expect(test.eventPublisher).toHaveEmitted(new OnboardingCompleted('memberId'));
  });

  it("set a member's onboarding as not completed", async () => {
    test.membersRepository.add(createMember({ id: 'memberId', status: MemberStatus.active }));

    test.command.data.onboardingCompleted = false;
    await test.execute();

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('status', MemberStatus.onboarding);
    expect(test.eventPublisher.events).toHaveLength(0);
  });
});
