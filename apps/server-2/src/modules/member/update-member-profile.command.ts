import { UpdateMemberProfileData } from '@sel/shared';
import { eq } from 'drizzle-orm';

import { events } from 'src/infrastructure/events';
import { db, schema } from 'src/persistence';

import { MemberInsert, MemberStatus, OnboardingCompletedEvent } from './member.entities';

type UpdateMemberProfileCommand = {
  memberId: string;
  data: UpdateMemberProfileData;
};

export async function updateMemberProfile(command: UpdateMemberProfileCommand): Promise<void> {
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

  await db.update(schema.members).set(values).where(eq(schema.members.id, memberId));

  if (data.onboardingCompleted) {
    events.emit(new OnboardingCompletedEvent(memberId));
  }
}
