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
