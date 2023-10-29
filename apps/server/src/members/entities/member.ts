import { createFactory, createId } from '@sel/utils';

import { Address } from './address';

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumbers: string[];
  bio?: string;
  address?: Address;
};

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  email: '',
  phoneNumbers: [],
}));
