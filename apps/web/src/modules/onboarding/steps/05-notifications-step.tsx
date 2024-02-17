import { createForm } from '@felte/solid';
import { createEffect } from 'solid-js';

import { Switch } from '../../../components/switch';
import { container } from '../../../infrastructure/container';
import { NotificationType } from '../../../infrastructure/notifications/notifications.port';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { notify } from '../../../utils/notify';
import { NextButton } from '../components/next-button';
import { OnboardingStep, OnboardingStepProps } from '../onboarding-types';

const T = Translate.prefix('onboarding.steps.notifications');

export function NotificationsStep(props: OnboardingStepProps<OnboardingStep.notifications>) {
  const { form, data, setFields } = createForm({
    initialValues: props.initialValues,
    onSubmit: props.onSubmit,
    onError: createErrorHandler(),
  });

  const t = T.useTranslation();
  const subscription = container.resolve(TOKENS.pushSubscription);
  const onError = createErrorHandler();

  createEffect(() => {
    if (data('notifications.push')) {
      // eslint-disable-next-line no-console
      subscription.registerDevice().catch((error) => {
        if (error instanceof Error && error.message === 'permission denied') {
          notify(NotificationType.error, t('pushPermissionDenied'));
          setFields('notifications.push', false);
        } else {
          onError(error);
        }
      });
    }
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

      <Switch name="notifications.email">
        <T id="email" />
      </Switch>

      <Switch name="notifications.push">
        <T id="push" />
      </Switch>

      <NextButton class="self-start">
        <Translate id="onboarding.navigation.next" />
      </NextButton>
    </form>
  );
}
