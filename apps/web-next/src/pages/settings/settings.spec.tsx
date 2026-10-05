import {
  createAuthenticatedMember,
  type AuthenticatedMember,
  type UpdateNotificationDeliveryData,
} from '@sel/shared';
import { screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { activateLocale } from 'src/app/locale';
import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { SettingsPage } from './settings-page';

describe('settings', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker');
    localStorage.clear();
    activateLocale('en');
    delete document.documentElement.dataset.theme;
  });

  it("shows the app's version", async () => {
    renderPage();

    expect(await screen.findByText(`Version ${__APP_VERSION__}`)).toBeInTheDocument();
  });

  it("shows the member's notification settings", async () => {
    renderPage();

    expect(await screen.findByRole('switch', { name: 'By email' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Push notifications' })).not.toBeChecked();
  });

  it('enables the push notifications', async () => {
    renderPage();

    await user.click(await screen.findByRole('switch', { name: 'Push notifications' }));

    expect(screen.getByRole('switch', { name: 'Push notifications' })).toBeChecked();
    expect(server.updated).toEqual([{ email: true, push: true }]);
    expect(server.member.notificationDelivery).toEqual({ email: true, push: true });
  });

  it('restores the notification settings when they could not be saved', async () => {
    server.failing = true;
    renderPage();

    await user.click(await screen.findByRole('switch', { name: 'By email' }));

    expect(await screen.findByText('The notification settings could not be saved')).toBeInTheDocument();
    expect(await screen.findByRole('switch', { name: 'By email', checked: true })).toBeInTheDocument();

    server.failing = false;
    await user.click(screen.getByRole('switch', { name: 'By email' }));

    expect(server.updated).toEqual([{ email: false, push: false }]);
  });

  describe('push notifications on this device', () => {
    let pushManager: FakePushManager;

    beforeEach(() => {
      server.member.notificationDelivery.push = true;
      pushManager = new FakePushManager();

      vi.stubGlobal('__ENV__', { VITE_WEB_PUSH_PUBLIC_KEY: 'public-key' });
      vi.stubGlobal('PushManager', FakePushManager);
      vi.stubGlobal('Notification', {
        permission: 'default',
        requestPermission: () => Promise.resolve('granted'),
      });

      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: { ready: Promise.resolve({ pushManager }) },
      });
    });

    it('registers this device', async () => {
      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Allow on this device' }));

      expect(await screen.findByText('The notifications will appear on this device')).toBeInTheDocument();
      expect(screen.queryByText('This device does not receive the notifications')).not.toBeInTheDocument();
      expect(pushManager.options).toEqual({ userVisibleOnly: true, applicationServerKey: 'public-key' });
      expect(server.registered).toEqual([{ deviceType: 'desktop', subscription: subscriptionJson }]);
    });

    it('does not register this device when the member refuses', async () => {
      vi.stubGlobal('Notification', {
        permission: 'default',
        requestPermission: () => Promise.resolve('denied'),
      });
      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Allow on this device' }));

      expect(await screen.findByText(/The notifications are blocked on this device/)).toBeInTheDocument();
      expect(server.registered).toEqual([]);
    });

    it('registers this device when the push notifications are enabled and already allowed', async () => {
      server.member.notificationDelivery.push = false;
      vi.stubGlobal('Notification', { permission: 'granted' });
      renderPage();

      await user.click(await screen.findByRole('switch', { name: 'Push notifications' }));

      await vi.waitFor(() =>
        expect(server.registered).toEqual([{ deviceType: 'desktop', subscription: subscriptionJson }]),
      );
    });

    it('explains when this browser cannot receive the notifications', async () => {
      vi.stubGlobal('__ENV__', {});
      renderPage();

      expect(await screen.findByText(/This browser cannot receive the notifications/)).toBeInTheDocument();
    });

    it('does not show the device state when the push notifications are disabled', async () => {
      server.member.notificationDelivery.push = false;
      renderPage();

      expect(await screen.findByRole('switch', { name: 'Push notifications' })).not.toBeChecked();
      expect(screen.queryByText('This device does not receive the notifications')).not.toBeInTheDocument();
    });
  });

  it('follows the device appearance by default', async () => {
    renderPage();

    expect(await screen.findByRole('radio', { name: 'Same as the device' })).toBeChecked();
  });

  it('changes the appearance', async () => {
    renderPage();

    await user.click(await screen.findByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('color-scheme')).toEqual('dark');
  });

  it('changes the language', async () => {
    renderPage();

    await user.click(await screen.findByRole('radio', { name: 'Français' }));

    expect(await screen.findByRole('heading', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Français' })).toBeChecked();
    expect(document.documentElement).toHaveAttribute('lang', 'fr');
    expect(localStorage.getItem('locale')).toEqual('fr');
  });
});

function renderPage() {
  renderTestPage(routes.settings(), [
    { path: routes.settings(), middleware: [requireSession], Component: SettingsPage },
  ]);
}

class Server extends FakeServer {
  member: AuthenticatedMember = createAuthenticatedMember({
    id: 'me',
    notificationDelivery: { email: true, push: false },
  });

  updated: UpdateNotificationDeliveryData[] = [];
  registered: unknown[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(this.member));

    this.register('PUT /api/members/me/notification-delivery', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const data = body as UpdateNotificationDeliveryData;

      this.updated.push(data);
      this.member = { ...this.member, notificationDelivery: data };

      return this.noContent();
    });

    this.register('POST /api/session/notifications/register-device', ({ body }) => {
      this.registered.push(body);

      return this.noContent();
    });
  }
}

const subscriptionJson = { endpoint: 'https://push.example/1', keys: { p256dh: 'p256dh', auth: 'auth' } };

class FakePushManager {
  options?: PushSubscriptionOptionsInit;
  private subscription: { toJSON: () => unknown } | null = null;

  getSubscription() {
    return Promise.resolve(this.subscription);
  }

  subscribe(options: PushSubscriptionOptionsInit) {
    this.options = options;
    this.subscription = { toJSON: () => subscriptionJson };

    return Promise.resolve(this.subscription);
  }
}
