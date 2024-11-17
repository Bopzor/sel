import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { detectDevice } from '../../utils/detect-device';
import { Api } from '../api';
import { ConfigPort } from '../config/config.port';

import { PushSubscriptionPort } from './push-subscription.port';

export class WebPushSubscriptionAdapter implements PushSubscriptionPort {
  static inject = injectableClass(this, TOKENS.config, TOKENS.api);

  constructor(
    private readonly config: ConfigPort,
    private readonly api: Api,
  ) {}

  async registerDevice(): Promise<boolean> {
    if (!navigator.serviceWorker) {
      throw new Error('no service worker');
    }

    if (localStorage.getItem('device-registered') === 'true') {
      return false;
    }

    const subscription = await this.getSubscription();

    if (subscription === null) {
      return false;
    }

    await this.api.registerDevice({
      body: {
        deviceType: detectDevice(),
        subscription,
      },
    });

    localStorage.setItem('device-registered', 'true');

    return true;
  }

  private async getSubscription(): Promise<PushSubscription | null> {
    const pushManager = await this.pushManager();
    let subscription = await pushManager.getSubscription();

    try {
      if (!subscription) {
        subscription = await pushManager.subscribe(this.options);
      }
    } catch {
      //
    }

    return subscription;
  }

  private get options(): PushSubscriptionOptionsInit {
    return {
      userVisibleOnly: true,
      applicationServerKey: this.config.push.publicKey,
    };
  }

  private async pushManager() {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager;
  }

  async getRegistrationState(): Promise<'prompt' | 'granted' | 'denied'> {
    const pushManager = await this.pushManager();
    return pushManager.permissionState(this.options);
  }
}
