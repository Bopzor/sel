import {
  createAuthenticatedMember,
  type CreateInformationBody,
  type File as UploadedFile,
} from '@sel/shared';
import { assert } from '@sel/utils';
import { screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { CreateInformationPage } from './create-information-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('create information', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('publishes the information and opens it', async () => {
    const router = renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'General assembly');
    await writeMessage(user, 'It takes place on Saturday at the town hall.');
    await user.click(screen.getByRole('button', { name: 'Publish the information' }));

    expect(await screen.findByText('Information published')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(routes.informationDetails('i1'));

    expect(server.posted).toEqual([
      {
        title: 'General assembly',
        body: '<p>It takes place on Saturday at the town hall.</p>',
        fileIds: [],
      },
    ]);
  });

  it('shows the errors under the fields', async () => {
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Publish the information' }));

    expect(await screen.findByText('This field should be at least 5 characters')).toBeInTheDocument();
    expect(screen.getByText('This field should be at least 15 characters')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveFocus();
    expect(server.posted).toEqual([]);
  });

  it('uploads the attached files and posts their ids', async () => {
    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'General assembly');
    await writeMessage(user, 'It takes place on Saturday at the town hall.');
    await attach(user, new File(['...'], 'agenda.pdf', { type: 'application/pdf' }));
    await screen.findByRole('button', { name: 'Remove agenda.pdf' });

    await user.click(screen.getByRole('button', { name: 'Publish the information' }));
    await screen.findByText('Information published');

    expect(server.posted[0]?.fileIds).toEqual(['f1']);
  });

  it('shows an alert when the information could not be published, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'General assembly');
    await writeMessage(user, 'It takes place on Saturday at the town hall.');
    await user.click(screen.getByRole('button', { name: 'Publish the information' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The information could not be published');
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue('General assembly');
  });
});

// Typing key by key drops characters in happy-dom's contenteditable, a paste does not.
async function writeMessage(user: UserEvent, text: string) {
  await user.click(screen.getByRole('textbox', { name: /^Message/ }));
  await user.paste(text);
}

async function attach(user: UserEvent, file: File) {
  const field = screen.getByRole('group', { name: 'Attachments' });
  const input = field.querySelector<HTMLInputElement>('input[type="file"]');
  assert(input !== null);

  await user.upload(input, file);
}

function renderPage() {
  return renderTestPage(routes.createInformation(), [
    { path: routes.createInformation(), middleware: [requireSession], Component: CreateInformationPage },
    { path: routes.informationDetails(':informationId'), Component: () => null },
  ]);
}

class Server extends FakeServer {
  posted: CreateInformationBody[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('POST /api/files/upload', ({ body }) => {
      const file = (body as FormData).get('file') as File;

      return this.json(
        { id: 'f1', name: 'f1.pdf', originalName: file.name, mimetype: file.type } satisfies UploadedFile,
        { status: 201 },
      );
    });

    this.register('POST /api/information', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      this.posted.push(body as CreateInformationBody);

      return Promise.resolve(
        new Response('i1', { status: 201, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
      );
    });
  }
}
