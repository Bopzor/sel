import { createAuthenticatedMember } from '@sel/shared';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Outlet } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { NotFoundPage, PageErrorBoundary, RootErrorBoundary } from './error-page';

describe('error page', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows that the page does not exist', async () => {
    renderApp('/nowhere');

    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', routes.home());
  });

  it('shows the end of the maintenance', async () => {
    server.maintenanceEnd = new Date(2026, 9, 8, 14).toISOString();

    renderApp(routes.home());

    expect(
      await screen.findByRole('heading', { level: 1, name: 'The application is under maintenance' }),
    ).toBeInTheDocument();
    expect(screen.getByText('It will be back on Thursday, October 8, 2026 at 2:00 PM.')).toBeInTheDocument();
  });

  it('shows the maintenance without an end', async () => {
    server.maintenanceEnd = null;

    renderApp(routes.home());

    expect(await screen.findByText('It will be back soon.')).toBeInTheDocument();
  });

  it('shows that the server cannot be reached', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')));

    renderApp(routes.home());

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Unable to reach the server' }),
    ).toBeInTheDocument();
  });

  it('shows the message of an unexpected error', async () => {
    server.failing = true;

    renderApp(routes.home());

    expect(
      await screen.findByRole('heading', { level: 1, name: 'An unexpected error happened' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Internal server error')).toBeInTheDocument();
  });

  it('shows an error of a page inside the layout', async () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);

    renderApp('/broken');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'An unexpected error happened' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Broken page')).toBeInTheDocument();
  });

  it('reloads the page to retry', async () => {
    const user = userEvent.setup();
    const reload = vi.spyOn(window.location, 'reload').mockReturnValue(undefined);

    server.failing = true;
    renderApp(routes.home());

    await user.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(reload).toHaveBeenCalled();
  });
});

function renderApp(path: string) {
  return renderTestPage(path, [
    {
      middleware: [requireSession],
      ErrorBoundary: RootErrorBoundary,
      element: <Layout />,
      children: [
        {
          ErrorBoundary: PageErrorBoundary,
          children: [
            { path: routes.home(), element: <h1>Home</h1> },
            { path: '/broken', Component: BrokenPage },
            { path: '*', Component: NotFoundPage },
          ],
        },
      ],
    },
  ]);
}

function Layout() {
  return (
    <>
      <nav />
      <Outlet />
    </>
  );
}

function BrokenPage(): React.ReactNode {
  throw new Error('Broken page');
}

class Server extends FakeServer {
  maintenanceEnd: string | null | undefined;
  failing = false;

  init() {
    this.register('GET /api/session/member', () => {
      if (this.maintenanceEnd !== undefined) {
        return this.json(
          { error: 'Maintenance mode', code: 'MaintenanceMode', end: this.maintenanceEnd },
          { status: 400 },
        );
      }

      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      return this.json(createAuthenticatedMember());
    });
  }
}
