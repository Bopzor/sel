import type { Member } from './member';

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
