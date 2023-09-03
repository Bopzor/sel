import { createFactory, createId } from '@sel/utils';

import { Address, createAddress } from './address';

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  address: Address;
};

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  bio: '',
  address: createAddress(),
}));
