import { UpdateMemberProfileData } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubEventsAdapter } from '../infrastructure/events/stub-events.adapter';
import { UnitTest } from '../unit-test';

import { MemberStatus, createMember } from './entities';
import { OnboardingCompleted } from './events';
import { InMemoryMembersRepository } from './in-memory-members.repository';
import { MembersService } from './members.service';

class Test extends UnitTest {
  events = new StubEventsAdapter();
  membersRepository = new InMemoryMembersRepository();
  service = new MembersService(this.events, this.membersRepository);
}

describe('MembersService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  const createUpdateMemberProfileData = createFactory<UpdateMemberProfileData>(() => ({
    firstName: '',
    lastName: '',
    emailVisible: true,
    phoneNumbers: [],
  }));

  it("updates a member's profile information", async () => {
    test.membersRepository.add(createMember({ id: 'memberId', firstName: 'Toto' }));

    await test.service.updateMemberProfile('memberId', createUpdateMemberProfileData({ firstName: 'Tata' }));

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('firstName', 'Tata');
  });

  it("sets a member's onboarding as completed", async () => {
    test.membersRepository.add(createMember({ id: 'memberId', status: MemberStatus.onboarding }));

    await test.service.updateMemberProfile(
      'memberId',
      createUpdateMemberProfileData({ onboardingCompleted: true })
    );

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('status', MemberStatus.active);
  });

  it('triggers an OnboardingCompleted domain event', async () => {
    test.membersRepository.add(createMember({ id: 'memberId', status: MemberStatus.onboarding }));

    await test.service.updateMemberProfile(
      'memberId',
      createUpdateMemberProfileData({ onboardingCompleted: true })
    );

    expect(test.events.events).toContainEqual(new OnboardingCompleted('memberId'));
  });

  it("set a member's onboarding as not completed", async () => {
    test.membersRepository.add(createMember({ id: 'memberId', status: MemberStatus.active }));

    await test.service.updateMemberProfile(
      'memberId',
      createUpdateMemberProfileData({ onboardingCompleted: false })
    );

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('status', MemberStatus.onboarding);
    expect(test.events.events).toHaveLength(0);
  });
});
