import type { Member, ProfileStep } from './member';

export type AuthenticatedMember = Member & {
  email: string;
  emailVisible: boolean;
  phoneNumberVisible: boolean;
  onboardingCompleted: boolean;
  completedProfileSteps: ProfileStep[];
  notificationDelivery: {
    email: boolean;
    push: boolean;
  };
};
