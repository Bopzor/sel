import { AuthenticatedMember, UpdateMemberProfileData } from '@sel/shared';
import { Component, Show, createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { authenticatedMember, getAppActions } from '../../app-context';
import { container } from '../../infrastructure/container';
import { TOKENS } from '../../tokens';
import { createAsyncCall } from '../../utils/create-async-call';
import { formatPhoneNumber } from '../../utils/format-phone-number';

import { Stepper } from './components/stepper';
import {
  OnboardingForm,
  OnboardingStep,
  OnboardingStepProps,
  OnboardingStepStates,
} from './onboarding-types';
import { WelcomeStep } from './steps/00-welcome-step';
import { NameStep } from './steps/01-name-step';
import { ContactStep } from './steps/02-contact-step';
import { BioStep } from './steps/03-bio-step';
import { AddressStep } from './steps/04-address-step';
import { EndStep } from './steps/05-end-step';

const getInitialValues = (member: AuthenticatedMember | undefined): OnboardingForm => ({
  firstName: member?.firstName ?? '',
  lastName: member?.lastName ?? '',
  email: member?.email ?? '',
  emailVisible: true,
  phoneNumber:
    member && member.phoneNumbers.length > 0 ? formatPhoneNumber(member.phoneNumbers[0].number) : '',
  phoneNumberVisible: true,
  bio: member?.bio ?? '',
});

const Steps: { [S in OnboardingStep]: Component<OnboardingStepProps<S>> } = {
  [OnboardingStep.welcome]: WelcomeStep,
  [OnboardingStep.name]: NameStep,
  [OnboardingStep.contact]: ContactStep,
  [OnboardingStep.address]: AddressStep,
  [OnboardingStep.bio]: BioStep,
  [OnboardingStep.end]: EndStep,
};

export default function OnboardingPage() {
  const profileApi = container.resolve(TOKENS.profileApi);

  const member = authenticatedMember();
  const initialValues = getInitialValues(member);
  const { refreshAuthenticatedMember } = getAppActions();

  const [step, setStep] = createSignal(OnboardingStep.welcome);
  const [stepStates, setStepStates] = createSignal<Partial<OnboardingStepStates>>({});

  const [onSubmit, submitting] = createAsyncCall(async (data: unknown) => {
    setStepStates((state) => ({ ...state, [step()]: data }));

    if (step() === OnboardingStep.bio) {
      const state = stepStates() as OnboardingStepStates;

      const data: UpdateMemberProfileData = {
        firstName: state[OnboardingStep.name].firstName,
        lastName: state[OnboardingStep.name].lastName,
        emailVisible: state[OnboardingStep.contact].emailVisible,
        phoneNumbers: [
          {
            number: state[OnboardingStep.contact].phoneNumber.replaceAll(' ', ''),
            visible: state[OnboardingStep.contact].phoneNumberVisible,
          },
        ],
        address: state[OnboardingStep.address].address || undefined,
        bio: state[OnboardingStep.bio].bio || undefined,
        onboardingCompleted: true,
      };

      await profileApi.updateMemberProfile(member?.id as string, data);
    }

    if (step() === OnboardingStep.end) {
      refreshAuthenticatedMember();
    }

    setStep((step) => step + 1);
  });

  return (
    <div class="col card mx-auto my-16 w-full max-w-4xl gap-4 rounded-xl p-8">
      <Show when={step() > OnboardingStep.welcome && step() < OnboardingStep.end}>
        <Stepper step={step()} setStep={setStep} />
      </Show>

      <Dynamic
        component={Steps[step()]}
        initialValues={initialValues}
        submitting={submitting()}
        onSubmit={onSubmit}
      />
    </div>
  );
}
