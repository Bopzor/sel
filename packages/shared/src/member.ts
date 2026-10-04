import { createDate, createFactory, createId, type ValueOf } from '@sel/utils';
import { z } from 'zod';

import { MembersSort } from './members-sort';

import type { Address } from './address';
import type { MemberInterest } from './interest';

export const MemberStatus = {
  onboarding: 'onboarding',
  inactive: 'inactive',
  active: 'active',
  system: 'system',
} as const;

export type MemberStatus = ValueOf<typeof MemberStatus>;

export const MemberRole = {
  member: 'member',
  admin: 'admin',
  system: 'system',
} as const;

export type MemberRole = ValueOf<typeof MemberRole>;

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  email?: string;
  phoneNumber?: string;
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
  number: number;
  avatar?: string;
};

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  number: 0,
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
  firstName: z.string().trim().min(1).max(256).optional(),
  lastName: z.string().trim().min(1).max(256).optional(),
  emailVisible: z.boolean().optional(),
  phoneNumber: z
    .string()
    .regex(/^0\d{9}$/)
    .optional(),
  phoneNumberVisible: z.boolean().optional(),
  bio: z.string().trim().max(4096).nullable().optional(),
  address: z
    .object({
      line1: z.string().trim().max(256),
      line2: z.string().trim().max(256).optional(),
      postalCode: z.string().trim().max(16),
      city: z.string().trim().max(256),
      country: z.string().trim().max(256),
      position: z.tuple([z.number(), z.number()]).optional(),
    })
    .nullable()
    .optional(),
  avatarFileName: z.string().nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateMemberProfileData = z.infer<typeof updateMemberProfileBodySchema>;

export const notificationDeliveryBodySchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
});
