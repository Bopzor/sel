import { createForm } from '@felte/solid';

import { FormField } from '../../../components/form-field';
import { Input } from '../../../components/input';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NextButton } from '../components/next-button';
import { OnboardingStepProps, OnboardingStep } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.name');

export function NameStep(props: OnboardingStepProps<OnboardingStep.name>) {
  // @ts-expect-error solidjs directive
  const { form } = createForm({
    initialValues: props.initialValues,
    onSubmit: props.onSubmit,
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col gap-4">
      <div class="col gap-1">
        <p>
          <T id="sentence1" />
        </p>
      </div>

      <FormField label={<T id="firstName" />}>
        <Input required name="firstName" variant="outlined" width="medium" maxlength={256} />
      </FormField>

      <FormField label={<T id="lastName" />}>
        <Input required name="lastName" variant="outlined" width="medium" maxlength={256} />
      </FormField>

      <NextButton>
        <Translate id="onboarding.navigation.next" />
      </NextButton>
    </form>
  );
}
