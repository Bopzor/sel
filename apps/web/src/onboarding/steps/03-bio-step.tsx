import { Component } from 'solid-js';

import { Translate } from '../../intl/translate';
import { OnboardingField } from '../components/onboarding-field';
import { OnboardingTextArea } from '../components/onboarding-input';
import { NextButton } from '../components/next-button';
import { OnboardingForm, OnFieldChange } from '../onboarding-form';

const T = Translate.prefix('onboarding.steps.bio');

type BioProp = {
  form: OnboardingForm;
  onFieldChange: OnFieldChange;
  onNext: () => void;
};

export const BioStep: Component<BioProp> = (props) => {
  return (
    <>
      <div>
        <p>
          <T id="sentence1" />
        </p>
        <p>
          <T id="sentence2" />
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onNext();
        }}
        class="col gap-4"
      >
        <OnboardingField label={<T id="bio" />}>
          <OnboardingTextArea
            name="bio"
            rows={6}
            width="full"
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
