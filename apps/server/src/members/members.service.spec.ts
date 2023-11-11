import { Member, UpdateMemberProfileData, createMember } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { UnitTest } from '../unit-test';

import { InMemoryMembersRepository } from './in-memory-members.repository';
import { MembersService } from './members.service';

class Test extends UnitTest {
  membersRepository = new InMemoryMembersRepository();
  service = new MembersService(this.membersRepository);

  createMember(overrides?: Partial<Member>) {
    const member = createMember(overrides);

    this.membersRepository.add({
      email: '',
      emailVisible: false,
      onboardingCompleted: false,
      ...member,
    });

    return member;
  }
}

describe('MembersService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  const createUpdateMemberProfileData = createFactory<UpdateMemberProfileData>(() => ({
    firstName: '',
    emailVisible: false,
    lastName: '',
    phoneNumbers: [],
  }));

  describe('updateMemberProfile', () => {
    it("updates a member's profile information", async () => {
      const member = test.createMember({ firstName: 'Toto' });

      await test.service.updateMemberProfile(
        member.id,
        createUpdateMemberProfileData({
          firstName: 'Tata',
        })
      );

      expect(test.membersRepository.get(member.id)).toHaveProperty('firstName', 'Tata');
    });

    it("marks the member's onboarding as completed", async () => {
      const member = test.createMember();

      await test.service.updateMemberProfile(
        member.id,
        createUpdateMemberProfileData({
          onboardingCompleted: true,
        })
      );

      expect(await test.membersRepository.getAuthenticatedMember(member.id)).toHaveProperty(
        'onboardingCompleted',
        true
      );
    });
  });
});
