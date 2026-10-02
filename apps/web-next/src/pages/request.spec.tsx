import {
  createAuthenticatedMember,
  RequestStatus,
  type Comment,
  type LightMember,
  type Request,
} from '@sel/shared';
import { assert, createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { RequestPage } from './request';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };
const julien: LightMember = { id: 'julien', number: 13, firstName: 'Julien', lastName: 'Petit' };

describe('request', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows the request', async () => {
    server.request = createRequest({
      title: 'Cat sitting',
      message: {
        body: '<p>I am away for a week.</p>',
        attachments: [
          { fileId: 'f1', name: 'cat.jpg', originalName: 'Whiskers.jpg', mimetype: 'image/jpeg' },
          { fileId: 'f2', name: 'notes.pdf', originalName: 'Instructions.pdf', mimetype: 'application/pdf' },
        ],
      },
    });

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Cat sitting' })).toBeDefined();
    expect(screen.getByText('I am away for a week.')).toBeDefined();
    expect(screen.getByRole('img', { name: 'Whiskers.jpg' })).toHaveProperty(
      'src',
      'http://localhost:8000/api/files/cat.jpg',
    );
    expect(screen.getByRole('link', { name: 'Instructions.pdf' })).toHaveProperty(
      'href',
      'http://localhost:8000/api/files/notes.pdf',
    );
    expect(screen.queryByRole('status')).toBeNull();
  });

  it("shows the requester's contact details", async () => {
    server.request = createRequest({
      requester: { ...claire, email: 'claire@example.com', phoneNumber: '0612345678' },
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Claire Dubois' })).toBeDefined();
    expect(screen.getByRole('link', { name: '06 12 34 56 78' })).toHaveProperty('href', 'tel:0612345678');
    expect(screen.getByRole('link', { name: 'claire@example.com' })).toHaveProperty(
      'href',
      'mailto:claire@example.com',
    );
  });

  it('lists the answers, positive first', async () => {
    server.request = createRequest({
      answers: [
        { id: 'a1', member: claire, answer: 'negative' },
        { id: 'a2', member: julien, answer: 'positive' },
      ],
    });

    renderPage();

    const answers = within(await findSection('Answers')).getAllByRole('listitem');

    expect(answers[0]?.textContent).toContain('Julien PetitCan help');
    expect(answers[1]?.textContent).toContain("Claire DuboisCan't help");
  });

  it('shows that no one has answered', async () => {
    server.request = createRequest({ answers: [] });

    renderPage();

    expect(await screen.findByText('No one has answered yet.')).toBeDefined();
  });

  it('lists the comments', async () => {
    server.request = createRequest({ id: 'r1' });
    server.comments = [
      createComment({ author: julien, message: { body: '<p>I can help.</p>', attachments: [] } }),
    ];

    renderPage();

    const comments = await findSection('1 comment');

    expect(within(comments).getByText('Julien Petit')).toBeDefined();
    expect(within(comments).getByText('I can help.')).toBeDefined();

    const [url] = server.find('/api/comment');
    expect(url?.searchParams.get('entityType')).toBe('request');
    expect(url?.searchParams.get('entityId')).toBe('r1');
  });

  it('shows that there is no comment', async () => {
    server.request = createRequest();

    renderPage();

    expect(await screen.findByText('No comments yet.')).toBeDefined();
  });

  it.each([
    [RequestStatus.fulfilled, 'This request is fulfilled'],
    [RequestStatus.canceled, 'This request was canceled'],
  ])('shows that the request is %s', async (status, message) => {
    server.request = createRequest({ status });

    renderPage();

    expect((await screen.findByRole('status')).textContent).toBe(message);
  });

  it('shows that the request does not exist', async () => {
    server.request = undefined;

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Request not found' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'See the requests' })).toHaveProperty(
      'href',
      'http://localhost:8000/requests',
    );
  });

  it('retries loading the request after a failure', async () => {
    const user = userEvent.setup();

    server.request = createRequest({ title: 'Cat sitting' });
    server.failing = true;

    renderPage();

    await screen.findByText('Unable to load the request');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Cat sitting' })).toBeDefined();
  });
});

function renderPage() {
  return renderTestPage(routes.request('r1'), [
    {
      path: routes.request(':requestId'),
      loader: requireSession,
      Component: RequestPage,
    },
  ]);
}

async function findSection(heading: string) {
  const title = await screen.findByRole('heading', { name: heading });
  const section = title.closest('section');

  assert(section !== null);

  return section;
}

class Server extends FakeServer {
  request: Request | undefined;
  comments: Comment[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/requests/r1', () => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      if (!this.request) {
        return this.json({ error: 'Request not found' }, { status: 404 });
      }

      return this.json(this.request);
    });

    this.register('GET /api/comment', () => this.json(this.comments));
  }
}

const createRequest = createFactory<Request>(() => ({
  id: 'r1',
  status: RequestStatus.pending,
  date: new Date().toISOString(),
  requester: claire,
  title: 'Request',
  message: { body: '', attachments: [] },
  hasTransactions: false,
  answers: [],
}));

let nextId = 1;

const createComment = createFactory<Comment>(() => ({
  id: `c${nextId++}`,
  author: claire,
  date: new Date().toISOString(),
  message: { body: '', attachments: [] },
}));
