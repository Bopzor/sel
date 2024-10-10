import * as shared from '@sel/shared';
import express from 'express';

import { unsetCookie } from 'src/infrastructure/cookie';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';

import { MemberStatus } from '../member/member.entities';
import { NotificationDeliveryType } from '../notification/notification.entities';

import { revokeSessionToken } from './domain/revoke-session-token.command';

export const router = express.Router();

router.delete('/', async (req, res) => {
  const token: string = req.cookies['token'];

  await revokeSessionToken({ tokenValue: token });

  res.header('Set-Cookie', unsetCookie('token'));
  res.status(HttpStatus.noContent).end();
});

router.get('/member', (req, res) => {
  const member = getAuthenticatedMember();

  res.json({
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
    onboardingCompleted: member.status !== MemberStatus.onboarding,
    notificationDelivery: {
      email: member.notificationDelivery.includes(NotificationDeliveryType.email),
      push: member.notificationDelivery.includes(NotificationDeliveryType.push),
    },
    interests: [],
  } satisfies shared.AuthenticatedMember);
});
