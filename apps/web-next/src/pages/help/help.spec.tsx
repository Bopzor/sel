import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { me } from 'src/tests/fixtures';
import { renderTestPage } from 'src/tests/test-page';

import { HelpPage } from './help-page';

describe('help', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', new Server().fetch);
  });

  it('offers to write to the LETS to ask for help', async () => {
    renderPage();

    const contact = await screen.findByRole('region', { name: 'Need help?' });
    const link = within(contact).getByRole('link', { name: 'Write to us' });

    expect(link).toHaveAttribute(
      'href',
      'mailto:contact@lets.test?subject=%5BLets%20Test%5D%20Help%20request',
    );
  });

  it('copies the contact email address', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Copy the email address' }));

    expect(await navigator.clipboard.readText()).toEqual('contact@lets.test');
  });

  it('reports a bug with the member number and the version of the app', async () => {
    renderPage();

    const link = await screen.findByRole('link', { name: 'Report a bug' });
    const url = new URL(link.getAttribute('href')!);

    expect(url.pathname).toEqual('contact@lets.test');
    expect(url.searchParams.get('subject')).toEqual('[Lets Test] Bug report');
    expect(url.searchParams.get('body')).toContain('Member #1');
    expect(url.searchParams.get('body')).toContain(`Version ${__APP_VERSION__}`);
  });

  it('points to the contact address when the email app does not open', async () => {
    renderPage();

    const feedback = await screen.findByRole('region', { name: 'A problem, an idea?' });

    expect(within(feedback).getByRole('link', { name: 'Write to us' })).toHaveAttribute(
      'href',
      routes.help('contact'),
    );
  });

  it('shows the answer of a question when it is opened', async () => {
    renderPage();

    const question = await screen.findByText('Who is notified when I write a comment?');
    const answer = screen.getByText('We prefer comments so that everyone stays in the loop.');

    expect(answer).not.toBeVisible();

    await userEvent.click(question);

    expect(answer).toBeVisible();
  });
});

function renderPage() {
  const router = renderTestPage(routes.help(), [
    { path: routes.help(), middleware: [requireSession], Component: HelpPage },
  ]);

  const config = queryClient.getQueryData(queries.config().queryKey)!;
  queryClient.setQueryData(queries.config().queryKey, { ...config, contactEmail: 'contact@lets.test' });

  return router;
}

class Server extends FakeServer {
  init() {
    this.register('GET /api/session/member', () => this.json(me));
  }
}
