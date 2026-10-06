import { createAuthenticatedMember, type Information, type LightMember } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { act, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { InformationPage } from './information-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('information', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('lists the information', async () => {
    server.items = [
      createInformation({
        id: 'i1',
        title: 'General assembly',
        message: { body: '<p>It takes place on Saturday.</p><ul><li>Vote</li></ul>', attachments: [] },
      }),
    ];

    renderPage(routes.information());

    const [item] = await findItems();

    expect(within(item).getByRole('link', { name: 'General assembly' })).toHaveAttribute(
      'href',
      '/information/i1',
    );
    expect(item).toHaveTextContent('It takes place on Saturday. Vote');
    expect(item).toHaveTextContent('Claire Dubois');
  });

  it('lists the information published by the association', async () => {
    server.items = [
      createInformation({
        id: 'i1',
        title: 'General assembly',
        message: { body: '<p>It takes place on Saturday.</p>', attachments: [] },
        author: undefined,
      }),
    ];

    renderPage(routes.information());

    const [item] = await findItems();

    expect(within(item).getByRole('link', { name: 'General assembly' })).toHaveAttribute(
      'href',
      '/information/i1',
    );
    expect(item).toHaveTextContent('It takes place on Saturday.');
  });

  it('searches the information', async () => {
    const user = userEvent.setup();

    server.items = [
      createInformation({ title: 'General assembly' }),
      createInformation({ title: 'New website' }),
    ];

    const router = renderPage(routes.information());

    await findItems();
    await user.type(screen.getByRole('searchbox', { name: 'Search the information' }), 'assembly');

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));

    expect(screen.getByRole('link', { name: 'General assembly' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?search=assembly');
  });

  it("shows the member's own information", async () => {
    const user = userEvent.setup();

    server.items = [
      createInformation({ title: 'General assembly' }),
      createInformation({ title: 'Lost keys', author: me }),
    ];

    renderPage(routes.information());

    await findItems();
    await user.click(screen.getByRole('button', { name: 'My information' }));

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));

    expect(screen.getByRole('link', { name: 'Lost keys' })).toBeInTheDocument();
    expect(server.find('/api/information').at(-1)?.searchParams.get('authorId')).toBe(me.id);
  });

  it('invites to publish information when there is none', async () => {
    renderPage(routes.information());

    await screen.findByText('No information');

    expect(screen.getByRole('link', { name: 'Publish information' })).toHaveAttribute(
      'href',
      routes.createInformation(),
    );
  });

  it('clears the filters when no information matches them', async () => {
    const user = userEvent.setup();

    server.items = [createInformation({ title: 'General assembly' })];

    const router = renderPage(`${routes.information()}?search=website&mine=true`);

    await user.click(await screen.findByRole('button', { name: 'Clear filters' }));

    await findItems();

    expect(router.state.location.search).toBe('');
    expect(screen.getByRole('searchbox', { name: 'Search the information' })).toHaveValue('');
  });

  it('shows more information', async () => {
    const user = userEvent.setup();

    server.items = Array.from({ length: 12 }, (_, index) =>
      createInformation({ title: `Information ${index + 1}` }),
    );

    renderPage(routes.information());

    expect(await findItems()).toHaveLength(10);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 10 of 12 pieces of information');

    await user.click(screen.getByRole('button', { name: 'Show more' }));

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(12));

    expect(screen.getByRole('status')).toHaveTextContent(/^12 pieces of information$/);
    expect(server.find('/api/information').at(-1)?.searchParams.get('page')).toBe('2');
  });

  it('retries when the information fails to load', async () => {
    const user = userEvent.setup();

    server.items = [createInformation({ title: 'General assembly' })];
    server.failing = true;

    renderPage(routes.information());

    await screen.findByText('Unable to load the information');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await findItems();
  });

  it('keeps the information when a refetch fails', async () => {
    server.items = [createInformation({ title: 'General assembly' })];

    renderPage(routes.information());

    await findItems();

    server.failing = true;
    await act(() => queryClient.refetchQueries({ queryKey: ['information-list'] }));

    // The query notifies its observers in a timeout.
    await act(() => new Promise((resolve) => setTimeout(resolve)));

    expect(screen.queryByText('Unable to load the information')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'General assembly' })).toBeInTheDocument();
  });
});

let nextId = 1;

const createInformation = createFactory<Information>(() => ({
  id: `i${nextId++}`,
  title: '',
  message: { body: '', attachments: [] },
  author: claire,
  publishedAt: new Date().toISOString(),
}));

// The skeleton's items have no link.
function findItems() {
  return vi.waitFor(() => {
    const items = screen.getAllByRole('listitem');
    items.forEach((item) => within(item).getByRole('link'));
    return items;
  });
}

function renderPage(path: string) {
  return renderTestPage(path, [
    { path: routes.information(), middleware: [requireSession], Component: InformationPage },
  ]);
}

class Server extends FakeServer {
  items: Information[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/information', ({ url }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const params = url.searchParams;
      const search = params.get('search')?.toLowerCase();

      const filtered = this.items.filter((information) => {
        if (params.has('authorId') && information.author?.id !== params.get('authorId')) return false;
        if (search && !information.title.toLowerCase().includes(search)) return false;
        return true;
      });

      return this.json(this.paginate(filtered, params), {
        headers: { 'X-Pagination-Total': String(filtered.length) },
      });
    });
  }
}
