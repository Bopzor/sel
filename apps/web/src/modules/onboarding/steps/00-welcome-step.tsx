import { createForm } from '@felte/solid';

import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NextButton } from '../components/next-button';
import { OnboardingStepProps, OnboardingStep } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.welcome');

export function WelcomeStep(props: OnboardingStepProps<OnboardingStep.welcome>) {
  const { form } = createForm({
    initialValues: props.initialValues,
    onSubmit: props.onSubmit,
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col gap-4">
      <h1 class="mb-4 text-3xl font-semibold">
        <T id="title" />
      </h1>

      <div class="col gap-1">
        <p>
          <T id="sentence1" />
        </p>
        <p>
          <T
            id="sentence2"
            values={{
              link: (children) => (
                <a href="https://selonnous.communityforge.net/user/167/contact">{children}</a>
              ),
            }}
          />
        </p>
      </div>

      <NextButton class="mb-6 mt-12 self-center">
        <Translate id="onboarding.navigation.start" />
      </NextButton>
    </form>
  );
}
