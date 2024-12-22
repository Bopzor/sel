import { assert } from '@sel/utils';

import { api } from 'src/application/api';
import { getAppConfig } from 'src/application/config';

export async function registerDevice(deviceType: 'mobile' | 'desktop') {
  if (localStorage.getItem('device-registered') === 'true') {
    return false;
  }

  const subscription = await getSubscription();

  if (subscription === null) {
    return false;
  }

  await api.registerDevice({
    body: { deviceType, subscription },
  });

  localStorage.setItem('device-registered', 'true');

  return true;
}

async function getSubscription() {
  const pushManager = await getPushManager();
  let subscription = await pushManager.getSubscription();

  try {
    if (!subscription) {
      subscription = await pushManager.subscribe(getPushOptions());
    }
  } catch {
    //
  }

  return subscription;
}

export async function getRegistrationState(): Promise<'prompt' | 'granted' | 'denied'> {
  const pushManager = await getPushManager();
  return pushManager.permissionState(getPushOptions());
}

function getPushOptions(): PushSubscriptionOptionsInit {
  const { pushPublicKey } = getAppConfig();

  return {
    userVisibleOnly: true,
    applicationServerKey: pushPublicKey,
  };
}

async function getPushManager() {
  const registration = await serviceWorker().ready;
  return registration.pushManager;
}

function serviceWorker() {
  assert(navigator.serviceWorker, 'No service worker');
  return navigator.serviceWorker;
}
