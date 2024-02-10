import { createForm } from '@felte/solid';

import { AddressSearch } from '../../../components/address-search';
import { FormField } from '../../../components/form-field';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NextButton } from '../components/next-button';
import { OnboardingStep, OnboardingStepProps } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.address');

export function AddressStep(props: OnboardingStepProps<OnboardingStep.address>) {
  const { form, data, setFields } = createForm({
    initialValues: props.initialValues,
    onSubmit: props.onSubmit,
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col gap-4">
      <div class="col gap-1">
        <p>
          <T id="sentence" />
        </p>
      </div>

      <FormField label={<T id="address" />}>
        <AddressSearch
          variant="outlined"
          value={data((data) => data.address)}
          onSelected={(address) => setFields({ address })}
        />
      </FormField>

      <NextButton type="submit">
        <Translate id="onboarding.navigation.next" />
      </NextButton>
    </form>
  );
}
