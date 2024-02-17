import { Address } from '@sel/shared';

export enum OnboardingStep {
  welcome = 0,
  name = 1,
  contact = 2,
  address = 3,
  bio = 4,
  notifications = 5,
  end = 6,
}

export type OnboardingStepStates = {
  [OnboardingStep.welcome]: never;
  [OnboardingStep.name]: {
    firstName: string;
    lastName: string;
  };
  [OnboardingStep.contact]: {
    email: string;
    emailVisible: boolean;
    phoneNumber: string;
    phoneNumberVisible: boolean;
  };
  [OnboardingStep.address]: {
    address: Address | undefined;
  };
  [OnboardingStep.bio]: {
    bio: string;
  };
  [OnboardingStep.notifications]: {
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  [OnboardingStep.end]: never;
};

export type OnboardingStepState<S extends OnboardingStep> = S extends keyof OnboardingStepStates
  ? OnboardingStepStates[S]
  : never;

export type OnboardingStepProps<S extends OnboardingStep> = {
  initialValues: OnboardingStepState<S>;
  submitting: boolean;
  onSubmit: (data: OnboardingStepState<S>) => void;
};
