import { createId } from '../../../../common/create-id';
import { Factory } from '../../../../common/factory';

export type GetMemberResult = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  address: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
    position: [lat: number, lng: number];
  };
};

export const createGetMemberResult: Factory<GetMemberResult> = (overrides) => ({
  id: createId(),
  email: '',
  firstName: '',
  lastName: '',
  fullName: '',
  phoneNumber: '',
  address: {
    line1: '',
    line2: '',
    postalCode: '',
    city: '',
    country: '',
    position: [0, 0],
  },
  ...overrides,
});
