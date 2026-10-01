import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createAuthenticatedMember, createConfig } from '@sel/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { requireNoSession, requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';

import { AuthenticationPage } from './authentication';

const code = '123456';

describe('authentication', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('redirects a signed-out visitor to the authentication page, keeping the requested page', async () => {
    const router = renderApp('/events?page=2');

    await screen.findByRole('textbox', { name: 'Email address' });

    expect(router.state.location.pathname).toBe('/authentication');
    expect(new URLSearchParams(router.state.location.search).get('next')).toBe('/events?page=2');
  });

  it('signs in with the code sent by email, then goes to the requested page', async () => {
    const user = userEvent.setup();
    const router = renderApp('/events');

    await user.type(await screen.findByRole('textbox', { name: 'Email address' }), 'member@domain.tld');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await screen.findByText('member@domain.tld');

    const [request] = server.find('/api/authentication/request-authentication-code');
    expect(request?.searchParams.get('email')).toBe('member@domain.tld');
    expect(request?.searchParams.get('next')).toBe('/events');

    await user.type(screen.getByRole('textbox', { name: 'Sign-in code' }), code);

    await screen.findByRole('heading', { name: 'Page' });
    expect(router.state.location.pathname).toBe('/events');
  });

  it('signs in with the code of the link of the email', async () => {
    const router = renderApp(
      `/authentication?${new URLSearchParams({ code, next: '/interests' }).toString()}`,
    );

    await screen.findByRole('heading', { name: 'Page' });

    expect(router.state.location.pathname).toBe('/interests');
    expect(server.find('/api/authentication/verify-authentication-code')).toHaveLength(1);
  });

  it('accepts a code pasted with a space', async () => {
    const user = userEvent.setup();

    const router = renderApp(`/authentication?code=000000`);

    await screen.findByText('This code is not valid. Check that it matches the one in the email.');

    const input = screen.getByRole('textbox', { name: 'Sign-in code' });

    await user.clear(input);
    await user.click(input);
    await user.paste('123 456');

    await screen.findByRole('heading', { name: 'Page' });
    expect(router.state.location.pathname).toBe('/');
  });

  it('asks for a valid email address', async () => {
    const user = userEvent.setup();

    renderApp('/authentication');

    const input = await screen.findByRole('textbox', { name: 'Email address' });

    await user.type(input, 'member');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    const error = 'Enter a valid email address, for example my@email.com.';

    await screen.findByText(error);
    expect(server.find('/api/authentication/request-authentication-code')).toHaveLength(0);

    await user.type(input, '@domain.tld');

    expect(screen.queryByText(error)).toBeNull();
  });

  it('explains why a code is rejected', async () => {
    server.errorCode = 'CodeExpired';

    renderApp(`/authentication?code=${code}`);

    await screen.findByText('This code has expired. Go back to receive a new one.');
  });

  it('keeps the email address when going back to the first step', async () => {
    const user = userEvent.setup();

    renderApp('/authentication');

    await user.type(await screen.findByRole('textbox', { name: 'Email address' }), 'member@domain.tld');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await user.click(await screen.findByRole('button', { name: 'Back' }));

    expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveProperty(
      'value',
      'member@domain.tld',
    );
  });

  it('redirects a signed-in member to the requested page', async () => {
    server.signedIn = true;

    const router = renderApp(routes.authentication('/interests'));

    await screen.findByRole('heading', { name: 'Page' });
    expect(router.state.location.pathname).toBe('/interests');
  });

  it('does not redirect to another site', async () => {
    server.signedIn = true;

    const router = renderApp(routes.authentication('//example.com/events'));

    await screen.findByRole('heading', { name: 'Page' });
    expect(router.state.location.pathname).toBe('/');
  });
});

const HydrateFallback = () => null;

function renderApp(path: string) {
  queryClient.setQueryData(queries.config().queryKey, createConfig());

  const router = createMemoryRouter(
    [
      {
        path: routes.authentication(),
        HydrateFallback,
        loader: requireNoSession,
        Component: AuthenticationPage,
      },
      {
        path: '*',
        HydrateFallback,
        loader: requireSession,
        element: <h1>Page</h1>,
      },
    ],
    {
      initialEntries: [path],
    },
  );

  render(
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>,
  );

  return router;
}

class Server extends FakeServer {
  signedIn = false;
  errorCode: string | undefined;

  init() {
    this.register('GET /api/session/member', () => {
      return this.signedIn
        ? this.json(200, createAuthenticatedMember())
        : this.json(401, { error: 'Authentication required' });
    });

    this.register('POST /api/authentication/request-authentication-code', () => this.noContent());

    this.register('GET /api/authentication/verify-authentication-code', ({ url }) => {
      if (url.searchParams.get('code') !== code) {
        return this.json(404, { error: 'Code not found', code: 'AuthenticationCodeNotFound' });
      }

      if (this.errorCode !== undefined) {
        return this.json(401, { error: 'Invalid code', code: this.errorCode });
      }

      this.signedIn = true;
      return this.noContent();
    });
  }
}
