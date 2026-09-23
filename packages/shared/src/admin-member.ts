import { createFactory, createId } from '@sel/utils';
import z from 'zod';

import { MemberStatus } from './member';

export type AdminMember = {
  id: string;
  status: MemberStatus;
  isMembershipUpToDate: boolean;
  firstName: string;
  lastName: string;
  number: number;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  balance: number;
};

export const createAdminMember = createFactory<AdminMember>(() => ({
  id: createId(),
  status: MemberStatus.active,
  isMembershipUpToDate: false,
  firstName: '',
  lastName: '',
  number: 0,
  email: '',
  balance: 0,
}));

export const listAdminMembersQuerySchema = z.object({
  sort: z.literal(['number', 'name', 'balance']).optional(),
  order: z.literal(['asc', 'desc']).optional(),
});
