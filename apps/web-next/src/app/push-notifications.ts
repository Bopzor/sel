import { api } from './api';
import { getEnv } from './env';

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

declare global {
  interface Navigator {
    // Not available in Firefox and Safari.
    userAgentData?: { mobile: boolean };
  }
}

function isMobile() {
  return navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
