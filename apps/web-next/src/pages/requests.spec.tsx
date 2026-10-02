import {
  createAuthenticatedMember,
  RequestStatus,
  type LightMember,
  type RequestListItem,
} from '@sel/shared';
import { act, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { RequestsPage } from './requests';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('requests', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('lists the open requests', async () => {
    server.items = [
      createRequest({
        id: 'r1',
        title: 'Cat sitting',
        message: { body: '<p>I am away for a week.</p><ul><li>Feed Whiskers</li></ul>', attachments: [] },
      }),
    ];

    renderPage(routes.requests());

    const [item] = await findItems();

    expect(within(item).getByRole('link', { name: 'Cat sitting' })).toHaveProperty(
      'href',
      'http://localhost:8000/requests/r1',
    );
    expect(item.textContent).toContain('I am away for a week. Feed Whiskers');
    expect(item.textContent).toContain('Claire Dubois');

    expect(server.find('/api/requests')[0]?.searchParams.get('status')).toBe(RequestStatus.pending);
  });

  it('shows the closed requests with their status', async () => {
    const user = userEvent.setup();

    server.items = [
      createRequest({ title: 'Lawn mowing', status: RequestStatus.fulfilled }),
      createRequest({ title: 'Bike repair', status: RequestStatus.canceled }),
    ];

    const router = renderPage(routes.requests());

    await screen.findByText('No requests');
    await user.click(screen.getByRole('button', { name: 'All' }));

    const [fulfilled, canceled] = await findItems();

    expect(fulfilled.textContent).toContain('Fulfilled');
    expect(canceled.textContent).toContain('Canceled');
    expect(router.state.location.search).toBe('?status=all');
  });

  it('searches the requests', async () => {
    const user = userEvent.setup();

    server.items = [createRequest({ title: 'Cat sitting' }), createRequest({ title: 'Trailer loan' })];

    const router = renderPage(routes.requests());

    await findItems();
    await user.type(screen.getByRole('searchbox', { name: 'Search the requests' }), 'cat');

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));

    expect(screen.getByRole('link', { name: 'Cat sitting' })).toBeDefined();
    expect(router.state.location.search).toBe('?search=cat');
  });

  it("shows the member's own requests", async () => {
    const user = userEvent.setup();

    server.items = [
      createRequest({ title: 'Cat sitting' }),
      createRequest({ title: 'Ride to the station', requester: me }),
    ];

    renderPage(routes.requests());

    await findItems();
    await user.click(screen.getByRole('button', { name: 'My requests' }));

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));

    expect(screen.getByRole('link', { name: 'Ride to the station' })).toBeDefined();
    expect(server.find('/api/requests').at(-1)?.searchParams.get('requesterId')).toBe(me.id);
  });

  it('reads the filters from the URL', async () => {
    renderPage(`${routes.requests()}?status=all&mine=true&search=cat`);

    await screen.findByText('No request matches these filters');

    const [request] = server.find('/api/requests');

    expect(request?.searchParams.has('status')).toBe(false);
    expect(request?.searchParams.get('requesterId')).toBe(me.id);
    expect(request?.searchParams.get('search')).toBe('cat');

    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'My requests' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('searchbox', { name: 'Search the requests' })).toHaveProperty('value', 'cat');
  });

  it('resets the search when the URL changes', async () => {
    const router = renderPage(`${routes.requests()}?search=cat`);

    const searchbox = await screen.findByRole('searchbox', { name: 'Search the requests' });

    expect(searchbox).toHaveProperty('value', 'cat');

    await act(() => router.navigate(routes.requests()));

    expect(searchbox).toHaveProperty('value', '');
  });

  it('invites to post a request when there is none', async () => {
    renderPage(routes.requests());

    await screen.findByText('No requests');

    expect(screen.getByRole('link', { name: 'Post a request' })).toHaveProperty(
      'href',
      `http://localhost:8000${routes.createRequest()}`,
    );
  });

  it('clears the filters when no request matches them', async () => {
    const user = userEvent.setup();

    server.items = [createRequest({ title: 'Cat sitting' })];

    const router = renderPage(`${routes.requests()}?search=bike&mine=true`);

    await user.click(await screen.findByRole('button', { name: 'Clear filters' }));

    await findItems();

    expect(router.state.location.search).toBe('');
    expect(screen.getByRole('searchbox', { name: 'Search the requests' })).toHaveProperty('value', '');
  });

  it('shows more requests', async () => {
    const user = userEvent.setup();

    server.items = Array.from({ length: 12 }, (_, index) => createRequest({ title: `Request ${index + 1}` }));

    renderPage(routes.requests());

    expect(await findItems()).toHaveLength(10);
    expect(screen.getByRole('status').textContent).toBe('Showing 10 of 12 requests');

    await user.click(screen.getByRole('button', { name: 'Show more' }));

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(12));

    expect(screen.getByRole('status').textContent).toBe('12 requests');
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull();
    expect(server.find('/api/requests').at(-1)?.searchParams.get('page')).toBe('2');
  });

  it('retries when the requests fail to load', async () => {
    const user = userEvent.setup();

    server.items = [createRequest({ title: 'Cat sitting' })];
    server.failing = true;

    renderPage(routes.requests());

    await screen.findByText('Unable to load the requests');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await findItems();
  });

  it('keeps the requests when a refetch fails', async () => {
    server.items = [createRequest({ title: 'Cat sitting' })];

    renderPage(routes.requests());

    await findItems();

    server.failing = true;
    await act(() => queryClient.refetchQueries({ queryKey: ['requests'] }));

    // The query notifies its observers in a timeout.
    await act(() => new Promise((resolve) => setTimeout(resolve)));

    expect(screen.queryByText('Unable to load the requests')).toBeNull();
    expect(screen.getByRole('link', { name: 'Cat sitting' })).toBeDefined();
  });

  it('retries when more requests fail to load', async () => {
    const user = userEvent.setup();

    server.items = Array.from({ length: 12 }, (_, index) => createRequest({ title: `Request ${index + 1}` }));

    renderPage(routes.requests());

    expect(await findItems()).toHaveLength(10);

    server.failing = true;
    await user.click(screen.getByRole('button', { name: 'Show more' }));

    await screen.findByText('Unable to load more elements');

    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull();

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(12));

    expect(screen.queryByText('Unable to load more elements')).toBeNull();
  });
});

let nextId = 1;

function createRequest(overrides: Partial<RequestListItem> = {}): RequestListItem {
  return {
    id: `r${nextId++}`,
    status: RequestStatus.pending,
    date: new Date().toISOString(),
    requester: claire,
    title: '',
    message: { body: '', attachments: [] },
    ...overrides,
  };
}

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
    {
      path: routes.requests(),
      loader: requireSession,
      Component: RequestsPage,
    },
  ]);
}

class Server extends FakeServer {
  items: RequestListItem[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/requests', ({ url }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const params = url.searchParams;
      const search = params.get('search')?.toLowerCase();

      const filtered = this.items.filter((request) => {
        if (params.has('status') && request.status !== params.get('status')) return false;
        if (params.has('requesterId') && request.requester.id !== params.get('requesterId')) return false;
        if (search && !request.title.toLowerCase().includes(search)) return false;
        return true;
      });

      return this.json(this.paginate(filtered, params), {
        headers: { 'X-Pagination-Total': String(filtered.length) },
      });
    });
  }
}
