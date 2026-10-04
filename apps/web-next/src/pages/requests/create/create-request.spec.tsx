import { createAuthenticatedMember, type CreateRequestBody } from '@sel/shared';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type z from 'zod';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { CreateRequestPage } from './create-request-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('create request', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('posts the request and opens it', async () => {
    const router = renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
    await writeMessage(user, 'I need someone with a drill on Saturday.');
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    expect(await screen.findByText('Request posted')).toBeDefined();
    expect(router.state.location.pathname).toBe(routes.request('r1'));

    expect(server.posted).toEqual([
      {
        title: 'Help to put up a shelf',
        body: '<p>I need someone with a drill on Saturday.</p>',
        fileIds: [],
      },
    ]);
  });

  it('shows the errors under the fields and focuses the first one', async () => {
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Post the request' }));

    expect(await screen.findByText('This field should be at least 5 characters')).toBeDefined();
    expect(screen.getByText('This field should be at least 15 characters')).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /^Title/ }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(server.posted).toEqual([]);
  });

  it('shows the errors returned by the API under the fields', async () => {
    server.issues = [
      {
        code: 'too_big',
        origin: 'string',
        maximum: 200,
        inclusive: true,
        path: ['body'],
        message: 'Too big',
      },
    ];

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
    await writeMessage(user, 'I need someone with a drill on Saturday.');
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    expect(await screen.findByText('This field should be at most 200 characters')).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /^Message/ }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an alert when the request could not be posted, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
    await writeMessage(user, 'I need someone with a drill on Saturday.');
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toContain('Your request could not be posted');
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveProperty('value', 'Help to put up a shelf');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    expect(await screen.findByText('Request posted')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an alert when the server cannot be reached', async () => {
    server.offline = true;

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
    await writeMessage(user, 'I need someone with a drill on Saturday.');
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toContain('Unable to reach the server, check your internet access');
    expect(alert.textContent).not.toContain('Failed to fetch');
  });
});

// Typing key by key drops characters in happy-dom's contenteditable, a paste does not.
async function writeMessage(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByRole('textbox', { name: /^Message/ }));
  await user.paste(text);
}

function renderPage() {
  return renderTestPage(routes.createRequest(), [
    {
      path: routes.createRequest(),
      loader: requireSession,
      Component: CreateRequestPage,
    },
    {
      path: routes.request(':requestId'),
      Component: () => null,
    },
  ]);
}

class Server extends FakeServer {
  posted: CreateRequestBody[] = [];
  issues: z.core.$ZodIssue[] = [];
  failing = false;
  offline = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('POST /api/requests', ({ body }) => {
      if (this.offline) {
        return Promise.reject(new TypeError('Failed to fetch'));
      }

      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      if (this.issues.length > 0) {
        return this.validationError(this.issues);
      }

      this.posted.push(body as CreateRequestBody);

      return Promise.resolve(
        new Response('r1', { status: 201, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
      );
    });
  }
}
