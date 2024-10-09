import { createForm } from '@felte/solid';

import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NextButton } from '../components/next-button';
import { OnboardingStepProps, OnboardingStep } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.end');

export function EndStep(props: OnboardingStepProps<OnboardingStep.end>) {
  // @ts-expect-error solidjs directive
  const { form } = createForm({
    initialValues: props.initialValues,
    onSubmit: () => props.onSubmit(null as never),
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

        <ul class="list-inside list-disc">
          <li>
            <a href="https://join.slack.com/t/selons-nous/shared_invite/zt-23rygmgs7-CxJupKgeTM0OrV4WQXuFaA">
              <T id="contact.slack" />
            </a>
          </li>

          <li>
            <T
              id="contact.email"
              values={{
                email: 'selons-nous@nilscox.dev',
                link: (children) => <a href="mailto:selons-nous@nilscox.dev">{children}</a>,
              }}
            />
          </li>
        </ul>
      </div>

      <NextButton class="self-center">
        <Translate id="onboarding.navigation.end" />
      </NextButton>
    </form>
  );
}
