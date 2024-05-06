import { createDate, createFactory, createId } from '@sel/utils';

import { Member } from './member';

export type AuthenticatedMember = Member & {
  email: string;
  emailVisible: boolean;
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
  email: '',
  emailVisible: false,
  phoneNumbers: [],
  onboardingCompleted: false,
  membershipStartDate: createDate().toISOString(),
  notificationDelivery: {
    email: false,
    push: false,
  },
  interests: [],
}));
