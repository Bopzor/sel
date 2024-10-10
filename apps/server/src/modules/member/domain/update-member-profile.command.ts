import { UpdateMemberProfileData } from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';

import { MemberInsert, MemberStatus, OnboardingCompletedEvent } from '../member.entities';
import { updateMember } from '../member.persistence';

type UpdateMemberProfileCommand = {
  memberId: string;
  data: UpdateMemberProfileData;
};

export async function updateMemberProfile(command: UpdateMemberProfileCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { memberId, data } = command;
  const { firstName, lastName, emailVisible, phoneNumbers, bio, address, onboardingCompleted } = data;

  const values: Partial<MemberInsert> = {
    firstName,
    lastName,
    emailVisible,
    phoneNumbers,
    bio,
    address,
  };

  if (onboardingCompleted === true) {
    values.status = MemberStatus.active;
  }

  if (onboardingCompleted === false) {
    values.status = MemberStatus.onboarding;
  }

  await updateMember(memberId, values);

  if (data.onboardingCompleted) {
    events.publish(new OnboardingCompletedEvent(memberId));
  }
}
