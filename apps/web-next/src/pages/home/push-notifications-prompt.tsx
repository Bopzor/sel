import { Trans, useLingui } from '@lingui/react/macro';
import { ProfileStep } from '@sel/shared';
import { Alert, Button, showToast } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { getPushPermission, requestPushPermission } from 'src/app/push-notifications';
import { useSession } from 'src/app/session';

const storageKey = 'push-notifications-prompt-dismissed';

export function PushNotificationsPrompt() {
  const { t } = useLingui();
  const me = useSession();

  // display the banner on next page load after the profile step is completed
  const [dismissed, setDismissed] = useState(
    () =>
      !me.completedProfileSteps.includes(ProfileStep.notifications) ||
      localStorage.getItem(storageKey) === 'true',
  );

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
      showToast(t`Notifications couldn't be enabled on this device. Try again in a few moments.`, 'error'),
  });

  if (dismissed || !me.notificationDelivery.push || getPushPermission() !== 'default') {
    return null;
  }

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <Alert.Root tone="info" onClose={dismiss} closeLabel={t`Close`}>
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
