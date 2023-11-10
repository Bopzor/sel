import { createFactory } from '@sel/utils';

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
