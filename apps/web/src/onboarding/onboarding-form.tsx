import { Address } from '@sel/shared';

export type OnboardingForm = {
  firstName: string;
  lastName: string;
  emailVisible: boolean;
  phoneNumber: string;
  phoneNumberVisible: boolean;
  bio: string;
  bioVisible: boolean;
  address?: Address;
  addressVisible: boolean;
};

export type OnFieldChange = (
  field: keyof OnboardingForm
) => (event: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => void;

export type OnFieldVisibilityChange = (
  field: 'email' | 'phoneNumber' | 'bio' | 'address'
) => (visible: boolean) => void;
