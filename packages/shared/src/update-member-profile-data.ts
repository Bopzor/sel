import { Address } from './address';

export type UpdateMemberProfileData = {
  firstName: string;
  lastName: string;
  emailVisible: boolean;
  phoneNumbers: Array<{ number: string; visible: boolean }>;
  bio?: string;
  address?: Address;
  onboardingCompleted?: boolean;
};
