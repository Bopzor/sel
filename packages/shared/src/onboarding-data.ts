import { UpdateMemberProfileData } from './update-member-profile-data';

export type OnboardingData = {
  profile: UpdateMemberProfileData;
  notificationDelivery?: {
    email: boolean;
    push: boolean;
  };
};
