import { createForm } from '@felte/solid';

import { Translate } from '../../../intl/translate';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { NotificationDeliveryOptions } from '../../profile/settings/notification-settings';
import { NextButton } from '../components/next-button';
import { OnboardingStep, OnboardingStepProps } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.notifications');

export function NotificationsStep(props: OnboardingStepProps<OnboardingStep.notifications>) {
  // @ts-expect-error solidjs directive
  const { form, data } = createForm({
    initialValues: props.initialValues.notifications,
    onSubmit: (notifications) => props.onSubmit({ notifications }),
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="col gap-4">
      <div class="col gap-1">
        <p>
          <T id="sentence1" />
        </p>
      </div>

      <NotificationDeliveryOptions pushEnabled={data('push')} />

      <NextButton class="self-start">
        <Translate id="onboarding.navigation.next" />
      </NextButton>
    </form>
  );
}
