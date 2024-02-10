import { Icon } from 'solid-heroicons';
import { check } from 'solid-heroicons/outline';
import { Component, For, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { Translate } from '../../../intl/translate';
import { OnboardingStep } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps');

type StepsProps = {
  step: OnboardingStep;
  setStep: (step: number) => void;
};

export const Stepper: Component<StepsProps> = (props) => {
  return (
    <ol class="grid list-inside list-decimal grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
      <For
        each={Array(4)
          .fill(null)
          .map((_, step) => step + 1)}
      >
        {(step) => <Dynamic component={Step} step={step} currentStep={props.step} setStep={props.setStep} />}
      </For>
    </ol>
  );
};

type StepProps = {
  step: OnboardingStep;
  currentStep: OnboardingStep;
  setStep: (step: number) => void;
};

const Step: Component<StepProps> = (props) => {
  const label = {
    [OnboardingStep.welcome]: '',
    [OnboardingStep.name]: <T id="name.title" />,
    [OnboardingStep.contact]: <T id="contact.title" />,
    [OnboardingStep.address]: <T id="address.title" />,
    [OnboardingStep.bio]: <T id="bio.title" />,
    [OnboardingStep.end]: '',
  };

  return (
    <li
      class="border-b-2"
      classList={{
        'text-green border-green': props.currentStep > props.step,
        'font-semibold border-strong': props.currentStep === props.step,
        'text-dim': props.currentStep < props.step,
      }}
    >
      <button
        disabled={props.step > props.currentStep}
        onClick={() => props.setStep(props.step)}
        class="inline-flex flex-row items-center gap-2"
      >
        {label[props.step]}

        <Show when={props.currentStep > props.step}>
          <Icon path={check} stroke-width={3} class="inline-block h-4" />
        </Show>
      </button>
    </li>
  );
};
