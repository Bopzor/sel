import { useLingui } from '@lingui/react/macro';
import type { UpdateNotificationDeliveryData } from '@sel/shared';
import { showToast } from '@sel/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from './api';
import { getEnv } from './env';
import { isMobile } from './install-app';
import { queries } from './queries';
import { useSession } from './session';

export type PushPermission = NotificationPermission | 'unsupported';

export function getPushPermission(): PushPermission {
  const supported =
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    getEnv('VITE_WEB_PUSH_PUBLIC_KEY') !== undefined;

  return supported ? Notification.permission : 'unsupported';
}

export async function requestPushPermission() {
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    await registerDevice();
  }

  return permission;
}

export async function unsubscribePushNotification() {
  const { pushManager } = await navigator.serviceWorker.ready;
  const subscription = await pushManager.getSubscription();

  await subscription?.unsubscribe();
}

export async function registerDevice() {
  const { pushManager } = await navigator.serviceWorker.ready;
  const applicationServerKey = getEnv('VITE_WEB_PUSH_PUBLIC_KEY');

  const subscription =
    (await pushManager.getSubscription()) ??
    (await pushManager.subscribe({ userVisibleOnly: true, applicationServerKey }));

  await api('POST', '/session/notifications/register-device', {
    body: { deviceType: isMobile() ? 'mobile' : 'desktop', subscription: subscription.toJSON() },
  });
}

export function useUpdateNotificationDelivery({ onError }: { onError?: () => void } = {}) {
  const me = useSession();
  const queryClient = useQueryClient();
  const { t } = useLingui();

  return useMutation({
    mutationFn: (body: UpdateNotificationDeliveryData) => {
      return api('PUT', `/members/${me.id}/notification-delivery`, { body });
    },
    onSuccess: (_, body) => {
      if (body.push && getPushPermission() === 'granted') {
        registerDevice().catch(() => {
          showToast(
            t`Notifications couldn't be enabled on this device. Try again in a few moments.`,
            'error',
          );
        });
      }
    },
    onError: () => {
      showToast(t`The notification settings couldn't be saved`, 'error');
      onError?.();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(queries.session());
    },
  });
}
