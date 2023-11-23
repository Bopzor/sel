import { Address } from '@sel/shared';
import { Component } from 'solid-js';

import { AddressSearch } from '../../components/address-search';
import { Translate } from '../../intl/translate';
import { NextButton } from '../components/next-button';
import { OnboardingField } from '../components/onboarding-field';
import { OnboardingForm } from '../onboarding-form';

const T = Translate.prefix('onboarding.steps.address');

type AddressProps = {
  form: OnboardingForm;
  onAddressSelected: (address: Address) => void;
  onNext: () => void;
};

export const AddressStep: Component<AddressProps> = (props) => {
  return (
    <>
      <div>
        <p>
          <T id="sentence" />
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onNext();
        }}
        class="col gap-4"
      >
        <OnboardingField label={<T id="address" />}>
          <AddressSearch value={props.form.address} onSelected={props.onAddressSelected} />
        </OnboardingField>

        <NextButton type="submit">
          <Translate id="onboarding.navigation.next" />
        </NextButton>
      </form>
    </>
  );
};
