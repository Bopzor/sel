import { Component } from 'solid-js';

import { Translate } from '../../intl/translate';
import { OnboardingField } from '../components/onboarding-field';
import { NextButton } from '../components/next-button';

const T = Translate.prefix('onboarding.steps.address');

type AddressProps = {
  onNext: () => void;
};

export const AddressStep: Component<AddressProps> = (props) => {
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onNext();
        }}
        class="col gap-4"
      >
        <OnboardingField label={<T id="address" />}>TODO</OnboardingField>

        <NextButton type="submit">
          <Translate id="onboarding.navigation.next" />
        </NextButton>
      </form>
    </>
  );
};
