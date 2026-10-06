import {
  createAuthenticatedMember,
  type CreateInformationBody,
  type Information,
  type LightMember,
} from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { EditInformationPage } from './edit-information-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('edit information', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('fills the form with the information', async () => {
    renderPage();

    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue('Assembly');
    expect(screen.getByRole('textbox', { name: /^Message/ })).toHaveTextContent(
      'It takes place on Saturday.',
    );
    expect(
      within(screen.getByRole('group', { name: 'Attachments' })).getByText('Agenda.pdf'),
    ).toBeInTheDocument();
  });

  it('saves the changes and opens the information', async () => {
    const router = renderPage();

    const title = await screen.findByRole('textbox', { name: /^Title/ });
    await user.clear(title);
    await user.type(title, 'General assembly');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));

    expect(await screen.findByText('Information edited')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(routes.informationDetails('i1'));

    expect(server.updated).toEqual([
      {
        title: 'General assembly',
        body: '<p>It takes place on Saturday.</p>',
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

    expect(await screen.findByRole('alert')).toHaveTextContent('Your changes could not be saved');
    expect(title).toHaveValue('Assembly on Saturday');
  });

  it("does not show the form for another member's information", async () => {
    server.information = createInformation({ author: claire });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'This information cannot be edited' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /^Title/ })).not.toBeInTheDocument();
  });

  it('shows when the information does not exist', async () => {
    server.information = undefined;

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Information not found' })).toBeInTheDocument();
  });
});

function renderPage() {
  return renderTestPage(routes.editInformation('i1'), [
    {
      path: routes.editInformation(':informationId'),
      middleware: [requireSession],
      Component: EditInformationPage,
    },
    { path: routes.informationDetails(':informationId'), Component: () => null },
  ]);
}

const createInformation = createFactory<Information>(() => ({
  id: 'i1',
  title: 'Assembly',
  message: {
    body: '<p>It takes place on Saturday.</p>',
    attachments: [
      { fileId: 'f1', name: 'agenda.pdf', originalName: 'Agenda.pdf', mimetype: 'application/pdf' },
    ],
  },
  author: me,
  publishedAt: new Date().toISOString(),
}));

class Server extends FakeServer {
  information?: Information = createInformation();
  updated: CreateInformationBody[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/information/i1', () => {
      if (!this.information) {
        return this.json({ error: 'Not found' }, { status: 404 });
      }

      return this.json(this.information);
    });

    this.register('PUT /api/information/i1', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      this.updated.push(body as CreateInformationBody);

      return this.noContent();
    });
  }
}
