import { createFactory, createId } from '@sel/utils';

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

export type Address = {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
  position?: [lng: number, lat: number];
};

export const createAddress = createFactory<Address>(() => ({
  line1: '',
  postalCode: '',
  city: '',
  country: '',
}));

export type Request = {
  id: string;
  requester: Member;
  title: string;
  description: string;
  creationDate: string;
  lastUpdateDate: string;
};

export const createRequest = createFactory<Request>(() => ({
  id: createId(),
  requester: createMember(),
  title: '',
  description: '',
  creationDate: '',
  lastUpdateDate: '',
}));
