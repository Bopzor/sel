import { createForm } from '@felte/solid';
import { JSX, Show, createResource } from 'solid-js';

import { authenticatedMember } from '../../../app-context';
import { Button } from '../../../components/button';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { createAsyncCall } from '../../../utils/create-async-call';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { detectDevice } from '../../../utils/detect-device';

const T = Translate.prefix('profile.settings.notifications');

export function NotificationSettings() {
  const profileApi = container.resolve(TOKENS.profileApi);
  const member = authenticatedMember();

  const { form, data, isDirty, isSubmitting } = createForm({
    initialValues: authenticatedMember()?.notificationDelivery,
    async onSubmit(data) {
      await profileApi.updateNotificationDelivery(member?.id as string, data);
    },
    onError: createErrorHandler(),
  });

  return (
    <form use:form class="card col gap-4 p-4">
      <h2>
        <T id="title" />
      </h2>

      <p>
        <T id="description" />
      </p>

      <NotificationDeliveryOptions />

      <DeviceRegistration pushEnabled={data('push')} />

      <div class="row gap-4">
        <Button variant="secondary" type="reset" disabled={!isDirty()}>
          <Translate id="common.cancel" />
        </Button>

        <Button variant="primary" type="submit" disabled={!isDirty()} loading={isSubmitting()}>
          <Translate id="common.save" />
        </Button>
      </div>
    </form>
  );
}

export function NotificationDeliveryOptions() {
  return (
    <>
      <div role="radiogroup" class="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NotificationDeliveryOption type="email">
          <T id="emailDescription" values={{ email: authenticatedMember()?.email }} />
        </NotificationDeliveryOption>

        <NotificationDeliveryOption type="push">
          <T id="pushDescription" />
        </NotificationDeliveryOption>
      </div>
    </>
  );
}

function NotificationDeliveryOption(props: { type: 'email' | 'push'; children: JSX.Element }) {
  return (
    // eslint-disable-next-line tailwindcss/no-arbitrary-value
    <label class="cursor-pointer rounded border p-4 ring-primary has-[:checked]:ring">
      <div class="row items-center gap-2">
        <input type="checkbox" class="size-em" name={props.type} />

        <strong>
          <T id={props.type} />
        </strong>
      </div>

      <p class="mt-2">{props.children}</p>
    </label>
  );
}

function DeviceRegistration(props: { pushEnabled: boolean }) {
  const push = container.resolve(TOKENS.pushSubscription);
  const [registration, { refetch }] = createResource(() => push.getRegistrationState());

  const [registerDevice] = createAsyncCall(() => push.registerDevice(), {
    onSettled: () => void refetch(),
  });

  return (
    <Show when={props.pushEnabled && detectDevice() === 'mobile'}>
      <Show when={registration.latest === 'prompt'}>
        <div class="rounded border border-yellow-600 p-4">
          <p class="text-lg font-semibold text-yellow-800">
            <T id="deviceNotRegisteredTitle" />
          </p>

          <p>
            <T
              id="deviceNotRegisteredDescription"
              values={{
                register: (children) => (
                  <button type="button" class="font-semibold text-primary" onClick={registerDevice}>
                    {children}
                  </button>
                ),
              }}
            />
          </p>
        </div>
      </Show>

      <Show when={registration.latest === 'denied'}>
        <T id="notificationPermissionDenied" />
      </Show>
    </Show>
  );
}
