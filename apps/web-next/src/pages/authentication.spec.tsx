import { createAuthenticatedMember } from '@sel/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FakeServer } from '../fake-server';
import { queryClient } from '../query-client';
import { routes } from '../routes';
import { requireNoSession, requireSession } from '../session';

import { AuthenticationPage } from './authentication';

const code = '123456';

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

function renderApp(path: string) {
  const HydrateFallback = () => null;

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
    { initialEntries: [path] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

describe('authentication', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('redirects a signed-out visitor to the authentication page, keeping the requested page', async () => {
    const router = renderApp('/events?page=2');

    await screen.findByRole('textbox', { name: 'Adresse email' });

    expect(router.state.location.pathname).toBe('/authentication');
    expect(new URLSearchParams(router.state.location.search).get('next')).toBe('/events?page=2');
  });

  it('signs in with the code sent by email, then goes to the requested page', async () => {
    const user = userEvent.setup();
    const router = renderApp('/events');

    await user.type(await screen.findByRole('textbox', { name: 'Adresse email' }), 'member@domain.tld');
    await user.click(screen.getByRole('button', { name: 'Connexion' }));

    await screen.findByText('member@domain.tld');

    const [request] = server.find('/api/authentication/request-authentication-code');
    expect(request?.searchParams.get('email')).toBe('member@domain.tld');
    expect(request?.searchParams.get('next')).toBe('/events');

    await user.type(screen.getByRole('textbox', { name: 'Code de connexion' }), code);

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

    await screen.findByText("Ce code n'est pas valide. Vérifiez qu'il correspond à celui de l'email.");

    const input = screen.getByRole('textbox', { name: 'Code de connexion' });

    await user.clear(input);
    await user.click(input);
    await user.paste('123 456');

    await screen.findByRole('heading', { name: 'Page' });
    expect(router.state.location.pathname).toBe('/');
  });

  it('asks for a valid email address', async () => {
    const user = userEvent.setup();

    renderApp('/authentication');

    const input = await screen.findByRole('textbox', { name: 'Adresse email' });

    await user.type(input, 'member');
    await user.click(screen.getByRole('button', { name: 'Connexion' }));

    const error = 'Saisissez une adresse email valide, par exemple mon@email.com.';

    await screen.findByText(error);
    expect(server.find('/api/authentication/request-authentication-code')).toHaveLength(0);

    await user.type(input, '@domain.tld');

    expect(screen.queryByText(error)).toBeNull();
  });

  it('explains why a code is rejected', async () => {
    server.errorCode = 'CodeExpired';

    renderApp(`/authentication?code=${code}`);

    await screen.findByText('Ce code a expiré. Revenez en arrière pour en recevoir un nouveau.');
  });

  it('keeps the email address when going back to the first step', async () => {
    const user = userEvent.setup();

    renderApp('/authentication');

    await user.type(await screen.findByRole('textbox', { name: 'Adresse email' }), 'member@domain.tld');
    await user.click(screen.getByRole('button', { name: 'Connexion' }));
    await user.click(await screen.findByRole('button', { name: 'Retour' }));

    expect(screen.getByRole('textbox', { name: 'Adresse email' })).toHaveProperty(
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
