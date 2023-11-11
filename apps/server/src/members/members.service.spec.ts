import { UpdateMemberProfileData } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { UnitTest } from '../unit-test';

import { MemberStatus, createMember } from './entities';
import { InMemoryMembersRepository } from './in-memory-members.repository';
import { MembersService } from './members.service';

class Test extends UnitTest {
  membersRepository = new InMemoryMembersRepository();
  service = new MembersService(this.membersRepository);
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
    test.membersRepository.add(
      createMember({ id: 'memberId', status: MemberStatus.inactive, firstName: 'Toto' })
    );

    const data = createUpdateMemberProfileData({ firstName: 'Tata' });

    await test.service.updateMemberProfile('memberId', data);

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('firstName', 'Tata');
    expect(member).toHaveProperty('status', MemberStatus.inactive);
  });

  it("sets a member's onboarding as completed", async () => {
    test.membersRepository.add(
      createMember({ id: 'memberId', status: MemberStatus.inactive, onboardingCompleted: false })
    );

    const data = createUpdateMemberProfileData({ onboardingCompleted: true });

    await test.service.updateMemberProfile('memberId', data);

    const member = test.membersRepository.get('memberId');

    expect(member).toHaveProperty('onboardingCompleted', true);
    expect(member).toHaveProperty('status', MemberStatus.active);
  });
});
