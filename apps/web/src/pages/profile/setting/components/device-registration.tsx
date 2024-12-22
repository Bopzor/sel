import { createMutation } from '@tanstack/solid-query';
import { createResource, Show } from 'solid-js';

import { notify } from 'src/application/notify';
import { createTranslate } from 'src/intl/translate';
import { detectDevice } from 'src/utils/detect-device';
import { getRegistrationState, registerDevice } from 'src/utils/device-registration';

const T = createTranslate('pages.profile.settings.deviceRegistration');

export function DeviceRegistration(props: { push?: boolean }) {
  const device = detectDevice();
  const [registration, { refetch }] = createResource(() => getRegistrationState());
  const t = T.useTranslate();

  const mutation = createMutation(() => ({
    async mutationFn() {
      return registerDevice(device);
    },
    async onSettled() {
      await refetch();
    },
    onSuccess(result) {
      if (result) {
        notify.success(t('registered'));
      } else {
        notify.error(t('registrationFailed'));
      }
    },
  }));

  return (
    <Show when={device === 'mobile' && props.push}>
      <Show when={registration.latest === 'prompt'}>
        <div class="rounded border border-yellow-600 p-4">
          <p class="text-lg font-semibold text-yellow-800">
            <T id="notRegistered.title" />
          </p>

          <p>
            <T
              id="notRegistered.description"
              values={{
                register: (children) => (
                  <button type="button" class="font-semibold text-link" onClick={() => mutation.mutate()}>
                    {children}
                  </button>
                ),
              }}
            />
          </p>
        </div>
      </Show>

      <Show when={registration.latest === 'denied'}>
        <p class="text-yellow-800">
          <T id="notificationPermissionDenied" />
        </p>
      </Show>
    </Show>
  );
}
