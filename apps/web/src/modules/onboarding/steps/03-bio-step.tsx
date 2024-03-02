import { createForm } from '@felte/solid';

import { FormField } from '../../../components/form-field';
import { TextArea } from '../../../components/text-area';
import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NextButton } from '../components/next-button';
import { OnboardingStepProps, OnboardingStep } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.bio');

export function BioStep(props: OnboardingStepProps<OnboardingStep.bio>) {
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
        <p>
          <T id="sentence2" />
        </p>
      </div>

      <FormField label={<T id="bio" />}>
        <TextArea name="bio" variant="outlined" width="full" rows={6} maxLength={4096} />
      </FormField>

      <NextButton type="submit" loading={props.submitting}>
        <Translate id="onboarding.navigation.next" />
      </NextButton>
    </form>
  );
}
