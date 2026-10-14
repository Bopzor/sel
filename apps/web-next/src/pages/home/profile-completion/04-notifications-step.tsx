import { Trans, useLingui } from '@lingui/react/macro';
import { Button, showToast, Switch } from '@sel/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { isIPhone, isPwaInstalled } from 'src/app/install-app';
import {
  getPushPermission,
  requestPushPermission,
  useUpdateNotificationDelivery,
} from 'src/app/push-notifications';
import { useSession } from 'src/app/session';

import { CompleteProfileStepButton, StepLayout } from './step-layout';

export function NotificationsStep() {
  const me = useSession();
  const updateDelivery = useUpdateNotificationDelivery();

  const delivery = updateDelivery.isPending ? updateDelivery.variables : me.notificationDelivery;

  const handleChange = (field: 'email' | 'push') => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateDelivery.mutate({ ...delivery, [field]: event.target.checked });
  };

  return (
    <StepLayout
      title={<Trans>How do you want to be notified?</Trans>}
      actions={
        <CompleteProfileStepButton step="notifications">
          <Trans>Next</Trans>
        </CompleteProfileStepButton>
      }
      className="stack gap-6"
    >
      <Switch
        size="sm"
        label={<Trans>By email</Trans>}
        checked={delivery.email}
        onChange={handleChange('email')}
      />

      <Switch
        size="sm"
        label={<Trans>On your devices</Trans>}
        checked={delivery.push}
        onChange={handleChange('push')}
      />

      {delivery.push && <DevicePermission />}
    </StepLayout>
  );
}

function DevicePermission() {
  const { t } = useLingui();
  const [permission, setPermission] = useState(getPushPermission);

  const mutation = useMutation({
    mutationFn: requestPushPermission,
    onSuccess: setPermission,
    onError: () =>
      showToast(t`Notifications couldn't be enabled on this device. Try again in a few moments.`, 'error'),
  });

  if (isIPhone() && !isPwaInstalled()) {
    return (
      <p className="text-body-sm text-muted">
        <Trans>On an iPhone, the app must be installed to receive notifications.</Trans>
      </p>
    );
  }

  if (permission === 'default') {
    return (
      <div className="stack items-start gap-2">
        <p className="text-body-sm text-muted">
          <Trans>The app needs your permission to receive notifications.</Trans>
        </p>
        <Button size="sm" variant="secondary" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Trans>Allow</Trans>
        </Button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <p className="text-body-sm text-muted">
        <Trans>
          Notifications are blocked on this device. To receive them, allow them in the browser settings.
        </Trans>
      </p>
    );
  }

  return null;
}
