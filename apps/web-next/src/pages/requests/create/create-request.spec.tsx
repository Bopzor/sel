import { createAuthenticatedMember, type CreateRequestBody, type File as UploadedFile } from '@sel/shared';
import { assert } from '@sel/utils';
import { screen } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type z from 'zod';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { CreateRequestPage } from './create-request-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('create request', () => {
  let user: UserEvent;
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

    expect(await screen.findByText('Request posted')).toBeInTheDocument();
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

    expect(await screen.findByText('This field should be at least 5 characters')).toBeInTheDocument();
    expect(screen.getByText('This field should be at least 15 characters')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

    expect(await screen.findByText('This field should be at most 200 characters')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Message/ })).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an alert when the request could not be posted, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
    await writeMessage(user, 'I need someone with a drill on Saturday.');
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('Your request could not be posted');
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue('Help to put up a shelf');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    expect(await screen.findByText('Request posted')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  describe('attachments', () => {
    it('offers to attach files in a field of their own', async () => {
      renderPage();

      const field = await screen.findByRole('group', { name: 'Attachments' });

      expect(field).toContainOneByRole('button', { name: 'Add files' });
      expect(screen.queryByRole('button', { name: 'Attach files' })).not.toBeInTheDocument();
    });

    it('uploads the attached files and posts their ids', async () => {
      renderPage();

      await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
      await writeMessage(user, 'I need someone with a drill on Saturday.');
      await attach(
        user,
        new File(['...'], 'shelf.jpg', { type: 'image/jpeg' }),
        new File(['...'], 'plan.pdf'),
      );

      expect(await screen.findByText('shelf.jpg')).toBeInTheDocument();
      expect(await screen.findByText('plan.pdf')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Post the request' }));
      await screen.findByText('Request posted');

      expect(server.uploaded).toEqual(['shelf.jpg', 'plan.pdf']);
      expect(server.posted[0]?.fileIds).toEqual(['f1', 'f2']);
    });

    it('removes an attached file', async () => {
      renderPage();

      await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
      await writeMessage(user, 'I need someone with a drill on Saturday.');
      await attach(user, new File(['...'], 'shelf.jpg', { type: 'image/jpeg' }));
      await user.click(await screen.findByRole('button', { name: 'Remove shelf.jpg' }));

      expect(screen.queryByText('shelf.jpg')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Post the request' }));
      await screen.findByText('Request posted');

      expect(server.posted[0]?.fileIds).toEqual([]);
    });

    it('does not post the request while a file is uploading', async () => {
      let endUpload!: () => void;
      server.uploadGate = new Promise((resolve) => (endUpload = resolve));

      renderPage();

      const title = await screen.findByRole('textbox', { name: /^Title/ });
      await user.type(title, 'Help to put up a shelf');
      await writeMessage(user, 'I need someone with a drill on Saturday.');
      await attach(user, new File(['...'], 'shelf.jpg', { type: 'image/jpeg' }));

      expect((await screen.findByText('shelf.jpg')).closest('li')).toHaveAttribute('aria-busy', 'true');

      await user.type(title, '{Enter}');

      expect(server.posted).toEqual([]);

      endUpload();
      await screen.findByRole('button', { name: 'Remove shelf.jpg' });
      await user.type(title, '{Enter}');
      await screen.findByText('Request posted');

      expect(server.posted[0]?.fileIds).toEqual(['f1']);
    });

    it('does not upload a file larger than 10 MB', async () => {
      renderPage();

      const file = new File(['...'], 'video.mp4');
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });

      await screen.findByRole('textbox', { name: /^Title/ });
      await attach(user, file);

      expect(
        await screen.findByText('video.mp4 is larger than 10 MB and was not attached'),
      ).toBeInTheDocument();
      expect(server.uploaded).toEqual([]);
    });

    it('shows that a file could not be uploaded', async () => {
      server.uploadFailing = true;

      renderPage();

      await screen.findByRole('textbox', { name: /^Title/ });
      await attach(user, new File(['...'], 'shelf.jpg', { type: 'image/jpeg' }));

      expect(
        await screen.findByText('shelf.jpg could not be attached. Try again in a few moments.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove shelf.jpg' })).not.toBeInTheDocument();
    });
  });

  it('shows an alert when the server cannot be reached', async () => {
    server.offline = true;

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Help to put up a shelf');
    await writeMessage(user, 'I need someone with a drill on Saturday.');
    await user.click(screen.getByRole('button', { name: 'Post the request' }));

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent('Unable to reach the server, check your internet access');
    expect(alert).not.toHaveTextContent('Failed to fetch');
  });
});

// Typing key by key drops characters in happy-dom's contenteditable, a paste does not.
async function writeMessage(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByRole('textbox', { name: /^Message/ }));
  await user.paste(text);
}

async function attach(user: ReturnType<typeof userEvent.setup>, ...files: File[]) {
  const field = screen.getByRole('group', { name: 'Attachments' });
  const input = field.querySelector<HTMLInputElement>('input[type="file"]');
  assert(input !== null);

  await user.upload(input, files);
}

function renderPage() {
  return renderTestPage(routes.createRequest(), [
    { path: routes.createRequest(), middleware: [requireSession], Component: CreateRequestPage },
    { path: routes.request(':requestId'), Component: () => null },
  ]);
}

class Server extends FakeServer {
  posted: CreateRequestBody[] = [];
  uploaded: string[] = [];
  uploadFailing = false;
  uploadGate?: Promise<void>;
  issues: z.core.$ZodIssue[] = [];
  failing = false;
  offline = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('POST /api/files/upload', async ({ body }) => {
      await this.uploadGate;

      if (this.uploadFailing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const file = (body as FormData).get('file') as File;
      this.uploaded.push(file.name);

      const id = `f${this.uploaded.length}`;

      return this.json(
        { id, name: `${id}.data`, originalName: file.name, mimetype: file.type } satisfies UploadedFile,
        { status: 201 },
      );
    });

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
