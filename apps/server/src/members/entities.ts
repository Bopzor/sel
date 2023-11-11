import { createFactory, createId } from '@sel/utils';

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVisible: boolean;
  phoneNumbers: PhoneNumber[];
  bio?: string;
  address?: Address;
  onboardingCompleted: boolean;
};

export const createMember = createFactory<Member>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  email: '',
  emailVisible: false,
  phoneNumbers: [],
  onboardingCompleted: false,
}));

export type PhoneNumber = {
  number: string;
  visible: boolean;
};

export const createPhoneNumber = createFactory<PhoneNumber>(() => ({
  number: '',
  visible: false,
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
