import { createFactory, createId, createDate } from '@sel/utils';
import { z } from 'zod';

import { Address } from './address';
import { MemberInterest } from './interest';
import { PhoneNumber } from './phone-number';

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumbers: PhoneNumber[];
  bio?: string;
  address?: Address;
  membershipStartDate: string;
  balance: number;
  interests: MemberInterest[];
};

export type LightMember = {
  id: string;
  firstName: string;
  lastName: string;
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

export const createMemberBodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string(),
});

export const updateMemberProfileBodySchema = z.object({
  firstName: z.string().trim().max(256),
  lastName: z.string().trim().max(256),
  emailVisible: z.boolean(),
  phoneNumbers: z.array(z.object({ number: z.string().regex(/^0\d{9}$/), visible: z.boolean() })),
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
  onboardingCompleted: z.boolean().optional(),
});
