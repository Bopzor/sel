import { createDate, createFactory, createId } from '@sel/utils';

import { Member } from './member';

export type AuthenticatedMember = Member & {
  email: string;
  emailVisible: boolean;
  phoneNumberVisible: boolean;
  onboardingCompleted: boolean;
  notificationDelivery: {
    email: boolean;
    push: boolean;
  };
};

export const createAuthenticatedMember = createFactory<AuthenticatedMember>(() => ({
  id: createId(),
  firstName: '',
  lastName: '',
  number: 0,
  email: '',
  emailVisible: false,
  phoneNumberVisible: false,
  onboardingCompleted: false,
  membershipStartDate: createDate().toISOString(),
  notificationDelivery: {
    email: false,
    push: false,
  },
  balance: 0,
  interests: [],
}));
