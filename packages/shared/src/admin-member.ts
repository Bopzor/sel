import z from 'zod';

import { MemberStatus } from './member';

export type AdminMember = {
  id: string;
  status: MemberStatus;
  firstName: string;
  lastName: string;
  number: number;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  balance: number;
};

export const listAdminMembersQuerySchema = z.object({
  sort: z.literal(['number', 'name', 'balance']).optional(),
  order: z.literal(['asc', 'desc']).optional(),
});
