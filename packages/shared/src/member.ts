import { createFactory, createId, createDate } from '@sel/utils';
import { z } from 'zod';

import { Address } from './address';
import { MemberInterest } from './interest';
import { MembersSort } from './members-sort';
import { PhoneNumber } from './phone-number';

export enum MemberStatus {
  onboarding = 'onboarding',
  inactive = 'inactive',
  active = 'active',
}

export enum MemberRole {
  member = 'member',
  admin = 'admin',
}

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumbers: PhoneNumber[];
  bio?: string;
  address?: Address;
  avatar?: string;
  membershipStartDate: string;
  balance: number;
  interests: MemberInterest[];
};

export type LightMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  phoneNumbers: [],
  membershipStartDate: createDate().toISOString(),
  balance: 0,
  interests: [],
}));

export const listMembersQuerySchema = z.object({
  sort: z.nativeEnum(MembersSort).optional(),
});

export const createMemberBodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string(),
});

export const updateMemberProfileBodySchema = z.object({
  firstName: z.string().trim().max(256).optional(),
  lastName: z.string().trim().max(256).optional(),
  emailVisible: z.boolean().optional(),
  phoneNumbers: z.array(z.object({ number: z.string().regex(/^0\d{9}$/), visible: z.boolean() })).optional(),
  bio: z.string().trim().max(4096).optional(),
  address: z
    .object({
      line1: z.string().trim().max(256),
      line2: z.string().trim().max(256).optional(),
      postalCode: z.string().trim().max(16),
      city: z.string().trim().max(256),
      country: z.string().trim().max(256),
      position: z.tuple([z.number(), z.number()]).optional(),
    })
    .optional(),
  avatarFileName: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateMemberProfileData = z.infer<typeof updateMemberProfileBodySchema>;

export const notificationDeliveryBodySchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
});
