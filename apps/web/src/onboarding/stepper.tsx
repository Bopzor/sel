import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { check } from 'solid-heroicons/outline';
import { Component, JSX, Show } from 'solid-js';

import { Translate } from '../intl/translate';

const T = Translate.prefix('onboarding.steps');

type StepsProps = {
  step: number;
  setStep: (step: number) => void;
};

export const Stepper: Component<StepsProps> = (props) => {
  return (
    <ol class="list-inside list-decimal">
      <Step stepNumber={1} currentStep={props.step} setStep={props.setStep}>
        <button disabled={props.step <= 1} onClick={() => props.setStep(1)}>
          <T id="name.title" />
        </button>
      </Step>

      <Step stepNumber={2} currentStep={props.step} setStep={props.setStep}>
        <button disabled={props.step <= 2} onClick={() => props.setStep(2)}>
          <T id="contact.title" />
        </button>
      </Step>

      <Step stepNumber={3} currentStep={props.step} setStep={props.setStep}>
        <button disabled={props.step <= 3} onClick={() => props.setStep(3)}>
          <T id="bio.title" />
        </button>
      </Step>

      <Step stepNumber={4} currentStep={props.step} setStep={props.setStep}>
        <button disabled={props.step <= 4} onClick={() => props.setStep(4)}>
          <T id="address.title" />
        </button>
      </Step>
    </ol>
  );
};

type StepProps = {
  stepNumber: number;
  currentStep: number;
  setStep: (step: number) => void;
  children: JSX.Element;
};

const Step: Component<StepProps> = (props) => {
  return (
    <li
      class={clsx(
        props.currentStep > props.stepNumber && 'text-green',
        props.currentStep === props.stepNumber && 'font-semibold',
        props.currentStep < props.stepNumber && 'text-dim'
      )}
    >
      <div class="inline-flex flex-row items-center gap-2">
        {props.children}

        <Show when={props.currentStep > props.stepNumber}>
          <Icon path={check} stroke-width={3} class="inline-block h-4 text-green" />
        </Show>
      </div>
    </li>
  );
};
