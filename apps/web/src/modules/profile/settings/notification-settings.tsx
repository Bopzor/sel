import { createForm } from '@felte/solid';
import { JSX, Show, createEffect, createResource } from 'solid-js';

import { Button } from '../../../components/button';
import { useInvalidateApi } from '../../../infrastructure/api';
import { container } from '../../../infrastructure/container';
import { Translate } from '../../../intl/translate';
import { TOKENS } from '../../../tokens';
import { getAuthenticatedMember } from '../../../utils/authenticated-member';
import { createAsyncCall } from '../../../utils/create-async-call';
import { createErrorHandler } from '../../../utils/create-error-handler';
import { detectDevice } from '../../../utils/detect-device';
import { notify } from '../../../utils/notify';

const T = Translate.prefix('profile.settings.notifications');

export function NotificationSettings() {
  const api = container.resolve(TOKENS.api);

  const authenticatedMember = getAuthenticatedMember();
  const invalidate = useInvalidateApi();

  const t = T.useTranslation();

  // @ts-expect-error solidjs directive
  const { form, setInitialValues, reset, data, isDirty, isSubmitting } = createForm({
    initialValues: authenticatedMember()?.notificationDelivery,
    async onSubmit(data) {
      await api.updateNotificationDelivery({ path: { memberId: authenticatedMember()!.id }, body: data });
    },
    async onSuccess() {
      await invalidate(['getAuthenticatedMember']);
      notify.success(t('saved'));
    },
    onError: createErrorHandler(),
  });

  createEffect(() => {
    const member = authenticatedMember();

    if (member) {
      setInitialValues(member.notificationDelivery);
      reset();
    }
  });

  return (
    <form use:form class="card col gap-4 p-4">
      <h2>
        <T id="title" />
      </h2>

      <p>
        <T id="description" />
      </p>

      <NotificationDeliveryOptions pushEnabled={data('push')} />

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

export function NotificationDeliveryOptions(props: { pushEnabled: boolean }) {
  const authenticatedMember = getAuthenticatedMember();

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

      <DeviceRegistration pushEnabled={props.pushEnabled} />
    </>
  );
}

function NotificationDeliveryOption(props: { type: 'email' | 'push'; children: JSX.Element }) {
  return (
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
  const t = T.useTranslation();

  const [registerDevice] = createAsyncCall(() => push.registerDevice(), {
    onSettled: () => void refetch(),
    onSuccess(result) {
      if (result) {
        notify.success(t('deviceRegistered'));
      } else {
        notify.error(t('deviceRegistrationFailed'));
      }
    },
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
