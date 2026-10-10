import { createAuthenticatedMember, type Document, type DocumentsGroup } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { DocumentsPage } from './documents-page';

const me = createAuthenticatedMember({ id: 'me' });

describe('documents', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('lists the documents by group', async () => {
    server.groups = [
      { name: 'Administratif', documents: [createDocument({ name: 'statuts.pdf', size: 991_719 })] },
      { name: 'Divers', documents: [createDocument({ name: 'Archives.zip', size: 47_860_711 })] },
    ];

    renderPage(routes.documents());

    const section = (await screen.findByRole('heading', { name: 'Administratif' })).closest('section')!;
    const link = within(section).getByRole('link', { name: 'statuts.pdf' });

    expect(link).toHaveAttribute('href', '/api/documents/statuts.pdf');
    expect(link).toHaveAttribute('target', '_blank');
    expect(within(section).getByRole('listitem')).toHaveTextContent('PDF • 992 kB');

    expect(screen.getByRole('heading', { name: 'Divers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Archives.zip' }).closest('li')).toHaveTextContent(
      'ZIP • 47.9 MB',
    );
  });

  it('shows when there are no documents', async () => {
    renderPage(routes.documents());

    expect(await screen.findByText('No documents')).toBeInTheDocument();
  });

  it('retries when the documents fail to load', async () => {
    const user = userEvent.setup();

    server.groups = [{ name: 'Administratif', documents: [createDocument({ name: 'statuts.pdf' })] }];
    server.failing = true;

    renderPage(routes.documents());

    await screen.findByText('Unable to load the documents');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('link', { name: 'statuts.pdf' })).toBeInTheDocument();
  });
});

const createDocument = createFactory<Document>(() => ({
  url: '',
  name: '',
  size: 1000,
  updated: new Date('2020-01-01').toISOString(),
}));

function renderPage(path: string) {
  return renderTestPage(path, [
    { path: routes.documents(), middleware: [requireSession], Component: DocumentsPage },
  ]);
}

class Server extends FakeServer {
  groups: DocumentsGroup[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/documents', () => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      return this.json(
        this.groups.map((group) => ({
          ...group,
          documents: group.documents.map((document) => ({ ...document, url: `/documents/${document.name}` })),
        })),
      );
    });
  }
}
