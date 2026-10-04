import {
  createAuthenticatedMember,
  type Comment,
  type CreateCommentBody,
  type File as UploadedFile,
} from '@sel/shared';
import { assert, createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { CommentsSection } from './comments-section';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire = { id: 'claire', firstName: 'Claire', lastName: 'Dubois' };
const julien = { id: 'julien', firstName: 'Julien', lastName: 'Petit' };

describe('CommentsSection', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows a skeleton while loading', async () => {
    renderSection();

    expect(await screen.findByRole('heading', { name: 'Comments' })).toBeDefined();
    expect(document.querySelector('[aria-busy]')).not.toBeNull();

    await screen.findByRole('button', { name: 'Send' });
  });

  it('lists the comments with their count', async () => {
    server.comments = [
      createComment({ author: julien, message: { body: '<p>I can help.</p>', attachments: [] } }),
      createComment({ author: claire, message: { body: '<p>Thank you!</p>', attachments: [] } }),
    ];

    renderSection();

    const section = await findSection('2 comments');

    expect(within(section).getByText('Julien Petit')).toBeDefined();
    expect(within(section).getByText('I can help.')).toBeDefined();
    expect(within(section).getByText('Claire Dubois')).toBeDefined();
    expect(within(section).getByText('Thank you!')).toBeDefined();
  });

  it('shows the form with the name of the member', async () => {
    renderSection();

    const section = await findSection('Comments');

    expect(await within(section).findByText('Jason Talon')).toBeDefined();
    expect(within(section).getByRole('button', { name: 'Send' })).toBeDefined();
  });

  it('retries loading the comments after a failure', async () => {
    const user = userEvent.setup();

    server.comments = [createComment({ message: { body: '<p>Hello there</p>', attachments: [] } })];
    server.failing = true;

    renderSection();

    await screen.findByText('Unable to load the comments');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Hello there')).toBeDefined();
  });

  describe('posting a comment', () => {
    it('sends the comment and shows it in the list', async () => {
      const user = userEvent.setup();

      renderSection();

      await write(user, 'A brand new comment');
      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(await screen.findByRole('heading', { name: '1 comment' })).toBeDefined();
      expect(await screen.findByText('A brand new comment')).toBeDefined();

      expect(server.posted).toEqual([
        { entityType: 'event', entityId: 'e1', body: '<p>A brand new comment</p>', fileIds: [] },
      ]);
    });

    it('clears the form once the comment is sent', async () => {
      const user = userEvent.setup();

      renderSection();

      await write(user, 'A brand new comment');
      await user.click(screen.getByRole('button', { name: 'Send' }));

      await screen.findByRole('heading', { name: '1 comment' });

      expect(screen.getByRole('textbox').textContent).toBe('');
    });

    it('sends the attached files with the comment, and clears them once sent', async () => {
      const user = userEvent.setup();

      renderSection();

      await write(user, 'Here is the plan');
      await attach(user, new File(['...'], 'plan.pdf', { type: 'application/pdf' }));

      expect(await screen.findByText('plan.pdf')).toBeDefined();

      await user.click(screen.getByRole('button', { name: 'Send' }));
      await screen.findByRole('heading', { name: '1 comment' });

      expect(server.posted[0]?.fileIds).toEqual(['f1']);
      expect(screen.queryByRole('button', { name: 'Remove plan.pdf' })).toBeNull();
    });

    it('does not send a comment that is too short', async () => {
      const user = userEvent.setup();

      renderSection();

      await write(user, 'Hi');
      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(await screen.findByText('This field should be at least 10 characters')).toBeDefined();
      expect(server.posted).toEqual([]);
    });

    it('shows that the comment could not be sent', async () => {
      const user = userEvent.setup();

      server.postFailing = true;

      renderSection();

      await write(user, 'A brand new comment');
      await user.click(screen.getByRole('button', { name: 'Send' }));

      expect(await screen.findByText('An error happened and your comment was not posted')).toBeDefined();
      expect(screen.getByRole('textbox').textContent).toBe('A brand new comment');
    });
  });
});

// Typing key by key drops characters in happy-dom's contenteditable, a paste does not.
async function write(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(await screen.findByRole('textbox'));
  await user.paste(text);
}

async function attach(user: ReturnType<typeof userEvent.setup>, file: File) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  assert(input !== null);

  await user.upload(input, file);
}

function renderSection() {
  return renderTest(<CommentsSection entityType="event" entityId="e1" />);
}

async function findSection(heading: string) {
  const title = await screen.findByRole('heading', { name: heading });
  const section = title.closest('section');

  assert(section !== null);

  return section;
}

class Server extends FakeServer {
  comments: Comment[] = [];
  posted: CreateCommentBody[] = [];
  failing = false;
  postFailing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/comment', () => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      return this.json(this.comments);
    });

    this.register('POST /api/files/upload', ({ body }) => {
      const file = (body as FormData).get('file') as File;

      return this.json(
        { id: 'f1', name: 'f1.pdf', originalName: file.name, mimetype: file.type } satisfies UploadedFile,
        { status: 201 },
      );
    });

    this.register('POST /api/comment', ({ body }) => {
      if (this.postFailing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const { entityType, entityId, ...rest } = body as CreateCommentBody;
      this.posted.push({ entityType, entityId, ...rest });

      this.comments.push(createComment({ author: me, message: { body: rest.body, attachments: [] } }));

      return this.noContent();
    });
  }
}

let nextId = 1;

const createComment = createFactory<Comment>(() => ({
  id: `c${nextId++}`,
  author: claire,
  date: new Date().toISOString(),
  message: { body: '', attachments: [] },
}));
