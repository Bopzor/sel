import { Component } from 'solid-js';

import { Translate } from '../../intl/translate';
import { NextButton } from '../components/next-button';
import { OnboardingField } from '../components/onboarding-field';
import { OnboardingInput } from '../components/onboarding-input';
import { OnFieldChange, OnboardingForm } from '../onboarding-form';

const T = Translate.prefix('onboarding.steps.name');

type NameStepProps = {
  form: OnboardingForm;
  onFieldChange: OnFieldChange;
  onNext: () => void;
};

export const NameStep: Component<NameStepProps> = (props) => {
  return (
    <>
      <div class="col gap-1">
        <p>
          <T id="sentence1" />
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onNext();
        }}
        class="col gap-4"
      >
        <OnboardingField label={<T id="firstName" />}>
          <OnboardingInput
            required
            name="firstName"
            maxlength={256}
            form={props.form}
            onFieldChange={props.onFieldChange}
          />
        </OnboardingField>

        <OnboardingField label={<T id="lastName" />}>
          <OnboardingInput
            required
            name="lastName"
            maxLength={256}
            form={props.form}
            onFieldChange={props.onFieldChange}
          />
        </OnboardingField>

        <NextButton type="submit">
          <Translate id="onboarding.navigation.next" />
        </NextButton>
      </form>
    </>
  );
};
