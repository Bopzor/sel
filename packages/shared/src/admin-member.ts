import { createFactory, createId } from '@sel/utils';

import { MemberStatus } from './member';
import { PhoneNumber } from './phone-number';

export type AdminMember = {
  id: string;
  status: MemberStatus;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumbers: PhoneNumber[];
  avatar?: string;
  balance: number;
};

export const createAdminMember = createFactory<AdminMember>(() => ({
  id: createId(),
  status: MemberStatus.active,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumbers: [],
  balance: 0,
}));
