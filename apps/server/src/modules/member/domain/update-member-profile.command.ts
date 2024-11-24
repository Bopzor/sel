import * as shared from '@sel/shared';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberInsert, OnboardingCompletedEvent } from '../member.entities';
import { updateMember } from '../member.persistence';

type UpdateMemberProfileCommand = {
  memberId: string;
  data: shared.UpdateMemberProfileData;
};

export async function updateMemberProfile(command: UpdateMemberProfileCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { memberId, data } = command;
  const { firstName, lastName, emailVisible, phoneNumbers, bio, address } = data;
  const { avatarFileName, onboardingCompleted } = data;

  const avatarFile = avatarFileName ? await getFile(avatarFileName) : undefined;

  const values: Partial<MemberInsert> = {
    firstName,
    lastName,
    emailVisible,
    phoneNumbers,
    bio,
    address,
    avatarId: avatarFile?.id,
  };

  if (onboardingCompleted === true) {
    values.status = shared.MemberStatus.active;
  }

  if (onboardingCompleted === false) {
    values.status = shared.MemberStatus.onboarding;
  }

  await updateMember(memberId, values);

  if (data.onboardingCompleted) {
    events.publish(new OnboardingCompletedEvent(memberId));
  }
}

async function getFile(fileName: string) {
  const file = await db.query.files.findFirst({
    where: eq(schema.files.name, fileName),
  });

  if (!file) {
    throw new NotFound('File not found');
  }

  return file;
}
