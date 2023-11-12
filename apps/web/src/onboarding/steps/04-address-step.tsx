import { Component } from 'solid-js';

import { AddressSearch } from '../../components/address-search';
import { Map } from '../../components/map';
import { Translate } from '../../intl/translate';
import { NextButton } from '../components/next-button';
import { OnboardingField } from '../components/onboarding-field';
import { OnboardingForm } from '../onboarding-form';

const T = Translate.prefix('onboarding.steps.address');

type AddressProps = {
  form: OnboardingForm;
  setValue: <Field extends keyof OnboardingForm>(field: Field, value: OnboardingForm[Field]) => void;
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
          <AddressSearch onAddressSelected={(address) => props.setValue('address', address)} />
        </OnboardingField>

        <Map
          center={props.form.address?.position ?? [5.042, 43.836]}
          zoom={props.form.address?.position ? 14 : 11}
          class="h-[400px] rounded-lg shadow"
          markers={
            props.form.address?.position
              ? [{ isPopupOpen: false, position: props.form.address.position }]
              : undefined
          }
        />

        <NextButton type="submit">
          <Translate id="onboarding.navigation.next" />
        </NextButton>
      </form>
    </>
  );
};
