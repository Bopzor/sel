import { createFactory, createId } from '@sel/utils';

import { MemberStatus } from './member';
import { PhoneNumber } from './phone-number';

export type AdminMember = {
  id: string;
  status: MemberStatus;
  firstName: string;
  lastName: string;
  number: number;
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
  number: 0,
  email: '',
  phoneNumbers: [],
  balance: 0,
}));
