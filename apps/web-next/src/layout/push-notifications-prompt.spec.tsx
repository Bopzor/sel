import { createAuthenticatedMember, type AuthenticatedMember } from '@sel/shared';
import { cleanup, screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { PushNotificationsPrompt } from './push-notifications-prompt';

describe('push notifications prompt', () => {
  let user: UserEvent;
  let server: Server;
  let member: AuthenticatedMember;
  let notification: { permission: NotificationPermission; answer: NotificationPermission };

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    member = createAuthenticatedMember({ notificationDelivery: { email: false, push: true } });
    notification = { permission: 'default', answer: 'granted' };

    vi.stubGlobal('fetch', server.fetch);
    vi.stubGlobal('__ENV__', { VITE_WEB_PUSH_PUBLIC_KEY: 'public-key' });
    vi.stubGlobal('PushManager', class {});

    vi.stubGlobal('Notification', {
      get permission() {
        return notification.permission;
      },
      requestPermission: () => {
        notification.permission = notification.answer;
        return Promise.resolve(notification.answer);
      },
    });

    const pushManager = {
      getSubscription: () => Promise.resolve(null),
      subscribe: () => Promise.resolve({ toJSON: () => subscriptionJson }),
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { ready: Promise.resolve({ pushManager }) },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker');
    localStorage.clear();
  });

  function render(path: string = routes.home()) {
    queryClient.setQueryData(queries.session().queryKey, member);

    renderTest(
      <MemoryRouter initialEntries={[path]}>
        <PushNotificationsPrompt />
      </MemoryRouter>,
    );
  }

  it('registers this device when the member allows the notifications', async () => {
    render();

    expect(screen.getByText('Receive notifications on this device?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Allow on this device' }));

    expect(await screen.findByText('This device will receive notifications')).toBeInTheDocument();
    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();
    expect(server.registered).toEqual([{ deviceType: 'desktop', subscription: subscriptionJson }]);
  });

  it('does not register this device when the member refuses the notifications', async () => {
    notification.answer = 'denied';
    render();

    await user.click(await screen.findByRole('button', { name: 'Allow on this device' }));

    expect(await screen.findByText(/Notifications are blocked on this device/)).toBeInTheDocument();
    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();
    expect(server.registered).toEqual([]);
  });

  it('reports when this device could not be registered', async () => {
    server.failing = true;
    render();

    await user.click(await screen.findByRole('button', { name: 'Allow on this device' }));

    expect(
      await screen.findByText(
        'Notifications could not be enabled on this device. Try again in a few moments.',
      ),
    ).toBeInTheDocument();
    expect(server.registered).toEqual([]);
  });

  it('is not shown again once dismissed', async () => {
    render();

    await user.click(await screen.findByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();

    cleanup();
    render();

    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();
  });

  it('is not shown when the push notifications are disabled', async () => {
    member.notificationDelivery.push = false;
    render();

    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();
  });

  it('is not shown when the notifications were already allowed or blocked on this device', async () => {
    notification.permission = 'denied';
    render();

    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();
  });

  it('is not shown on the settings page', async () => {
    render(routes.settings());

    expect(screen.queryByText('Receive notifications on this device?')).not.toBeInTheDocument();
  });
});

class Server extends FakeServer {
  registered: unknown[] = [];
  failing = false;

  init() {
    this.register('POST /api/session/notifications/register-device', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      this.registered.push(body);

      return this.noContent();
    });
  }
}

const subscriptionJson = {
  endpoint: 'https://push.example/1',
  keys: { p256dh: 'p256dh', auth: 'auth' },
};
