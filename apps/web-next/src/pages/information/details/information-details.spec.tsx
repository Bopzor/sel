import { createAuthenticatedMember, type Comment, type Information, type LightMember } from '@sel/shared';
import { assert, createFactory } from '@sel/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { InformationDetailsPage } from './information-details-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };
const julien: LightMember = { id: 'julien', number: 13, firstName: 'Julien', lastName: 'Petit' };

describe('information details', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows the information', async () => {
    server.information = createInformation({
      title: 'General assembly',
      message: {
        body: '<p>It takes place on Saturday.</p>',
        attachments: [
          { fileId: 'f1', name: 'agenda.pdf', originalName: 'Agenda.pdf', mimetype: 'application/pdf' },
        ],
      },
    });

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'General assembly' })).toBeInTheDocument();
    expect(screen.getByText('It takes place on Saturday.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Agenda.pdf' })).toHaveAttribute('href', '/api/files/agenda.pdf');
  });

  it('links to the author', async () => {
    server.information = createInformation({ author: claire });

    renderPage();

    const author = await screen.findByRole('heading', { name: 'Claire Dubois' });

    expect(author.closest('a')).toHaveAttribute('href', '/members/claire');
  });

  it('shows the information published by the association', async () => {
    server.information = createInformation({ author: undefined });

    renderPage();

    const author = await screen.findByRole('heading', { name: 'Lets Test' });

    expect(author.closest('a')).toBeNull();
  });

  it('lists the comments', async () => {
    server.information = createInformation({ id: 'i1' });
    server.comments = [
      createComment({ author: julien, message: { body: '<p>I will be there.</p>', attachments: [] } }),
    ];

    renderPage();

    const comments = await findSection('1 comment');

    expect(comments).toContainOneByText('Julien Petit');
    expect(comments).toContainOneByText('I will be there.');

    const [url] = server.find('/api/comment');
    expect(url?.searchParams.get('entityType')).toBe('information');
    expect(url?.searchParams.get('entityId')).toBe('i1');
  });

  it('offers the author to edit the information', async () => {
    server.information = createInformation({ author: me });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Your information' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/information/i1/edit');
  });

  it('does not offer to edit the information to another member', async () => {
    server.information = createInformation({ author: claire });

    renderPage();

    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByRole('heading', { name: 'Your information' })).not.toBeInTheDocument();
  });

  it('shows that the information does not exist', async () => {
    server.information = undefined;

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Information not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See the information' })).toHaveAttribute('href', '/information');
  });

  it('retries loading the information after a failure', async () => {
    const user = userEvent.setup();

    server.information = createInformation({ title: 'General assembly' });
    server.failing = true;

    renderPage();

    await screen.findByText('Unable to load the information');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'General assembly' })).toBeInTheDocument();
  });
});

function renderPage() {
  return renderTestPage(routes.informationDetails('i1'), [
    {
      path: routes.informationDetails(':informationId'),
      middleware: [requireSession],
      Component: InformationDetailsPage,
    },
  ]);
}

async function findSection(heading: string) {
  const title = await screen.findByRole('heading', { name: heading });
  const section = title.closest('section');

  assert(section !== null);

  return section;
}

const createInformation = createFactory<Information>(() => ({
  id: 'i1',
  title: 'Information',
  message: { body: '', attachments: [] },
  author: claire,
  publishedAt: new Date().toISOString(),
}));

const createComment = createFactory<Comment>(() => ({
  id: 'c1',
  date: new Date().toISOString(),
  author: claire,
  message: { body: '', attachments: [] },
}));

class Server extends FakeServer {
  information: Information | undefined;
  comments: Comment[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/information/i1', () => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      if (!this.information) {
        return this.json({ error: 'Information not found' }, { status: 404 });
      }

      return this.json(this.information);
    });

    this.register('GET /api/comment', () => this.json(this.comments));
  }
}
