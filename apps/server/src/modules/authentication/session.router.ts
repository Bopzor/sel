import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { eq } from 'drizzle-orm';
import express from 'express';

import { unsetCookie } from 'src/infrastructure/cookie';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';

import { File } from '../file/file.entity';
import { Interest, MemberInterest } from '../interest/interest.entities';
import { Member, MemberStatus } from '../member/member.entities';
import { NotificationDeliveryType } from '../notification/notification.entities';

import { revokeSessionToken } from './domain/revoke-session-token.command';

export const router = express.Router();

router.delete('/', async (req, res) => {
  const token: string = req.cookies['token'];

  await revokeSessionToken({ tokenValue: token });

  res.header('Set-Cookie', unsetCookie('token'));
  res.status(HttpStatus.noContent).end();
});

router.get('/member', async (req, res) => {
  const member = await db.query.members.findFirst({
    where: eq(schema.members.id, getAuthenticatedMember().id),
    with: {
      avatar: true,
      memberInterests: {
        with: { interest: true },
      },
    },
  });

  res.json(serializeAuthenticatedMember(defined(member)));
});

function serializeAuthenticatedMember(
  member: Member & { avatar: File | null; memberInterests: Array<MemberInterest & { interest: Interest }> },
): shared.AuthenticatedMember {
  const compareMemberInterests = (a: shared.MemberInterest, b: shared.MemberInterest) => {
    return a.label.localeCompare(b.label);
  };

  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    membershipStartDate: member.membershipStartDate?.toISOString(),
    balance: member.balance,
    phoneNumbers: member.phoneNumbers,
    email: member.email,
    emailVisible: member.emailVisible,
    bio: member.bio ?? undefined,
    address: member.address ?? undefined,
    avatar: member.avatar?.name,
    onboardingCompleted: member.status !== MemberStatus.onboarding,
    notificationDelivery: {
      email: member.notificationDelivery.includes(NotificationDeliveryType.email),
      push: member.notificationDelivery.includes(NotificationDeliveryType.push),
    },
    interests: member.memberInterests.map(serializeMemberInterest).sort(compareMemberInterests),
  };
}

function serializeMemberInterest(
  memberInterest: MemberInterest & { interest: Interest },
): shared.MemberInterest {
  return {
    id: memberInterest.id,
    interestId: memberInterest.interestId,
    label: memberInterest.interest.label,
    description: memberInterest.description ?? undefined,
  };
}
