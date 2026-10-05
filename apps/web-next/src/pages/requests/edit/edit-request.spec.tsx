import {
  createAuthenticatedMember,
  RequestStatus,
  type CreateRequestBody,
  type LightMember,
  type Request,
  type File as UploadedFile,
} from '@sel/shared';
import { assert, createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { EditRequestPage } from './edit-request-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('edit request', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('fills the form with the request', async () => {
    renderPage();

    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue('Shelf');
    expect(screen.getByRole('textbox', { name: /^Message/ })).toHaveTextContent(
      'I need a drill on Saturday.',
    );
    expect(
      within(screen.getByRole('group', { name: 'Attachments' })).getByText('Shelf.jpg'),
    ).toBeInTheDocument();
  });

  it('saves the changes and opens the request', async () => {
    const router = renderPage();

    const title = await screen.findByRole('textbox', { name: /^Title/ });
    await user.clear(title);
    await user.type(title, 'Help to put up a shelf');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));

    expect(await screen.findByText('Request edited')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(routes.request('r1'));

    expect(server.updated).toEqual([
      {
        title: 'Help to put up a shelf',
        body: '<p>I need a drill on Saturday.</p>',
        fileIds: ['f1'],
      },
    ]);
  });

  it('removes an attached file', async () => {
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Remove Shelf.jpg' }));

    expect(screen.queryByText('Shelf.jpg')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    await screen.findByText('Request edited');

    expect(server.updated[0]?.fileIds).toEqual([]);
  });

  it('attaches a file next to the existing ones', async () => {
    renderPage();

    await screen.findByText('Shelf.jpg');
    await attach(user, new File(['...'], 'plan.pdf', { type: 'application/pdf' }));
    await screen.findByRole('button', { name: 'Remove plan.pdf' });

    expect(screen.getByText('Shelf.jpg')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    await screen.findByText('Request edited');

    expect(server.updated[0]?.fileIds).toEqual(['f1', 'f2']);
  });

  it('shows an alert when the changes could not be saved, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    const title = await screen.findByRole('textbox', { name: /^Title/ });
    await user.type(title, ' on Saturday');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('Your changes could not be saved');
    expect(title).toHaveValue('Shelf on Saturday');
  });

  it("does not show the form for another member's request", async () => {
    server.request = createRequest({ requester: claire });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'This request cannot be edited' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /^Title/ })).not.toBeInTheDocument();
  });

  it('does not show the form for a closed request', async () => {
    server.request = createRequest({ status: RequestStatus.fulfilled });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'This request cannot be edited' })).toBeInTheDocument();
  });

  it('shows when the request does not exist', async () => {
    server.request = undefined;

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Request not found' })).toBeInTheDocument();
  });
});

async function attach(user: ReturnType<typeof userEvent.setup>, file: File) {
  const field = screen.getByRole('group', { name: 'Attachments' });
  const input = field.querySelector<HTMLInputElement>('input[type="file"]');
  assert(input !== null);

  await user.upload(input, file);
}

function renderPage() {
  return renderTestPage(routes.editRequest('r1'), [
    { path: routes.editRequest(':requestId'), middleware: [requireSession], Component: EditRequestPage },
    { path: routes.request(':requestId'), Component: () => null },
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

    this.register('POST /api/files/upload', ({ body }) => {
      const file = (body as FormData).get('file') as File;

      return this.json(
        { id: 'f2', name: 'f2.pdf', originalName: file.name, mimetype: file.type } satisfies UploadedFile,
        { status: 201 },
      );
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
