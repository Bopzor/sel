import { Trans, useLingui } from '@lingui/react/macro';
import { Alert, Button, showToast } from '@sel/ui';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useMatch } from 'react-router';

import { getPushPermission, requestPushPermission } from 'src/app/push-notifications';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';

const storageKey = 'push-notifications-prompt-dismissed';

export function PushNotificationsPrompt() {
  const { t } = useLingui();
  const { data: me } = useSuspenseQuery(queries.session());
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true');

  // The settings page shows the state of the device.
  const settingsPage = useMatch(routes.settings()) !== null;

  const mutation = useMutation({
    mutationFn: requestPushPermission,
    onSuccess: (permission) => {
      if (permission === 'granted') {
        showToast(t`This device will receive notifications`);
      }

      if (permission === 'denied') {
        showToast(
          t`Notifications are blocked on this device. You can allow them in the browser settings.`,
          'warning',
        );
      }
    },
    onError: () =>
      showToast(t`Notifications could not be enabled on this device. Try again in a few moments.`, 'error'),
  });

  if (dismissed || settingsPage || !me.notificationDelivery.push || getPushPermission() !== 'default') {
    return null;
  }

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <Alert.Root tone="info" onClose={dismiss} closeLabel={t`Close`} className="mb-6">
      <Alert.Title>
        <Trans>Receive notifications on this device?</Trans>
      </Alert.Title>
      <Alert.Description>
        <Trans>Follow the activity of the LETS, even when the app is closed.</Trans>
      </Alert.Description>
      <Alert.Actions>
        <Button size="sm" variant="secondary" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Trans>Allow on this device</Trans>
        </Button>
      </Alert.Actions>
    </Alert.Root>
  );
}
