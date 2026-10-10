import * as shared from '@sel/shared';

import { container } from 'src/infrastructure/container';
import { BadRequest, NotFound } from 'src/infrastructure/http';
import { db } from 'src/persistence';
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
  const { firstName, lastName, emailVisible, phoneNumber, phoneNumberVisible, bio, address } = data;
  const { avatarFileName, onboardingCompleted } = data;

  const values: Partial<MemberInsert> = {
    firstName,
    lastName,
    emailVisible,
    phoneNumber,
    phoneNumberVisible,
    bio,
    address,
  };

  if (avatarFileName === null) {
    values.avatarId = null;
  }

  if (avatarFileName) {
    const file = await getAvatarFile(memberId, avatarFileName);
    values.avatarId = file.id;
  }

  if (values.bio === '') {
    values.bio = null;
  }

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

async function getAvatarFile(memberId: string, fileName: string) {
  const file = await db.query.files.findFirst({
    where: { name: fileName },
  });

  if (!file) {
    throw new NotFound('File not found');
  }

  if (!file.mimetype.startsWith('image/')) {
    throw new BadRequest('The avatar must be an image');
  }

  if (file.uploadedBy !== memberId) {
    throw new BadRequest('The avatar must be uploaded by the member');
  }

  return file;
}
