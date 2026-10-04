import {
  createAuthenticatedMember,
  RequestStatus,
  type LightMember,
  type Request,
  type CreateRequestBody,
} from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { EditRequestPage } from './edit-request-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('edit request', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('fills the form with the request', async () => {
    renderPage();

    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveProperty('value', 'Shelf');
    expect(screen.getByRole('textbox', { name: /^Message/ }).textContent).toBe('I need a drill on Saturday.');
  });

  it('saves the changes and opens the request', async () => {
    const router = renderPage();

    const title = await screen.findByRole('textbox', { name: /^Title/ });
    await user.clear(title);
    await user.type(title, 'Help to put up a shelf');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));

    expect(await screen.findByText('Request edited')).toBeDefined();
    expect(router.state.location.pathname).toBe(routes.request('r1'));

    expect(server.updated).toEqual([
      {
        title: 'Help to put up a shelf',
        body: '<p>I need a drill on Saturday.</p>',
        fileIds: ['f1'],
      },
    ]);
  });

  it('shows an alert when the changes could not be saved, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    const title = await screen.findByRole('textbox', { name: /^Title/ });
    await user.type(title, ' on Saturday');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toContain('Your changes could not be saved');
    expect(title).toHaveProperty('value', 'Shelf on Saturday');
  });

  it("does not show the form for another member's request", async () => {
    server.request = createRequest({ requester: claire });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'This request cannot be edited' })).toBeDefined();
    expect(screen.queryByRole('textbox', { name: /^Title/ })).toBeNull();
  });

  it('does not show the form for a closed request', async () => {
    server.request = createRequest({ status: RequestStatus.fulfilled });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'This request cannot be edited' })).toBeDefined();
  });

  it('shows when the request does not exist', async () => {
    server.request = undefined;

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Request not found' })).toBeDefined();
  });
});

function renderPage() {
  return renderTestPage(routes.editRequest('r1'), [
    {
      path: routes.editRequest(':requestId'),
      loader: requireSession,
      Component: EditRequestPage,
    },
    {
      path: routes.request(':requestId'),
      Component: () => null,
    },
  ]);
}

const createRequest = createFactory<Request>(() => ({
  id: 'r1',
  status: RequestStatus.pending,
  date: new Date().toISOString(),
  requester: me,
  title: 'Shelf',
  message: {
    body: '<p>I need a drill on Saturday.</p>',
    attachments: [{ fileId: 'f1', name: 'shelf.jpg', originalName: 'Shelf.jpg', mimetype: 'image/jpeg' }],
  },
  hasTransactions: false,
  answers: [],
}));

class Server extends FakeServer {
  request?: Request = createRequest();
  updated: CreateRequestBody[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/requests/r1', () => {
      if (!this.request) {
        return this.json({ error: 'Not found' }, { status: 404 });
      }

      return this.json(this.request);
    });

    this.register('PUT /api/requests/r1', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      this.updated.push(body as CreateRequestBody);

      return this.noContent();
    });
  }
}
