import {
  RequestStatus,
  type FeedEvent,
  type FeedInformation,
  type FeedItem,
  type FeedRequest,
  type LightMember,
} from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { Feed } from './feed';

const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('feed', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function render() {
    renderTest(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>,
    );
  }

  async function findCard(title: string) {
    return (await screen.findByRole('link', { name: title })).closest('li')!;
  }

  it('lists the latest requests, events and information', async () => {
    server.items = [
      ['request', createRequest({ id: 'requestId', title: 'Borrow a ladder' })],
      ['event', createEvent({ id: 'eventId', title: 'Picnic' })],
      ['information', createInformation({ id: 'informationId', title: 'New members', author: claire })],
    ];

    render();

    expect(await findCard('Borrow a ladder')).toHaveTextContent('Request');
    expect(screen.getByRole('link', { name: 'Borrow a ladder' })).toHaveAttribute(
      'href',
      routes.request('requestId'),
    );
    expect(await findCard('Picnic')).toHaveTextContent('Event');
    expect(await findCard('New members')).toHaveTextContent('Information');
    expect(screen.getByText('3 publications')).toBeInTheDocument();
  });

  it('shows the status of a closed request', async () => {
    server.items = [
      ['request', createRequest({ title: 'Borrow a ladder', status: RequestStatus.fulfilled })],
    ];

    render();

    expect(within(await findCard('Borrow a ladder')).getByText('Fulfilled')).toBeInTheDocument();
  });

  it('shows the date of an event', async () => {
    server.items = [
      ['event', createEvent({ title: 'Picnic', date: '2026-06-01T10:00:00.000Z' })],
      ['event', createEvent({ title: 'Repair café' })],
    ];

    render();

    expect(within(await findCard('Picnic')).getByText(/June 1, 2026/)).toBeInTheDocument();
    expect(within(await findCard('Repair café')).getByText(/Date to be defined/)).toBeInTheDocument();
  });

  it('separates the details of an event, with or without location', async () => {
    const location = { line1: '', postalCode: '', city: 'Paris', country: '' };

    server.items = [
      ['event', createEvent({ title: 'Picnic', location })],
      ['event', createEvent({ title: 'Repair café' })],
    ];

    render();

    expect(await findCard('Picnic')).toHaveTextContent(/Event • Date to be defined • Paris$/);
    expect(await findCard('Repair café')).toHaveTextContent(/Event • Date to be defined$/);
  });

  it('shows the LETS as the author of an information without author', async () => {
    server.items = [['information', createInformation({ title: 'General assembly' })]];

    render();

    expect(within(await findCard('General assembly')).getByText('Lets Test')).toBeInTheDocument();
  });

  it('filters the publications by type', async () => {
    server.items = [['event', createEvent({ title: 'Picnic' })]];

    render();

    await findCard('Picnic');
    await userEvent.click(screen.getByRole('button', { name: 'Events' }));

    await vi.waitFor(() => {
      expect(server.find('/api/feed').at(-1)?.searchParams.get('resourceType')).toEqual('event');
    });
  });

  it('searches the publications', async () => {
    server.items = [['event', createEvent({ title: 'Picnic' })]];

    render();

    await findCard('Picnic');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search the publications' }), 'picnic');

    await vi.waitFor(() => {
      expect(server.find('/api/feed').at(-1)?.searchParams.get('search')).toEqual('picnic');
    });
  });

  it('offers to clear the filters when no publication matches them', async () => {
    server.items = [['event', createEvent({ title: 'Picnic' })]];

    render();

    await findCard('Picnic');
    await userEvent.click(screen.getByRole('button', { name: 'Requests' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Clear filters' }));

    expect(await findCard('Picnic')).toBeInTheDocument();
  });

  it('shows an empty state when nothing is published', async () => {
    render();

    expect(await screen.findByText('Nothing published yet')).toBeInTheDocument();
  });
});

let nextId = 1;

const createRequest = createFactory<FeedRequest>(() => ({
  id: `r${nextId++}`,
  status: RequestStatus.pending,
  requester: claire,
  title: '',
  message: { body: '', attachments: [] },
  publishedAt: new Date().toISOString(),
}));

const createEvent = createFactory<FeedEvent>(() => ({
  id: `e${nextId++}`,
  title: '',
  message: { body: '', attachments: [] },
  organizer: claire,
  publishedAt: new Date().toISOString(),
}));

const createInformation = createFactory<FeedInformation>(() => ({
  id: `i${nextId++}`,
  title: '',
  message: { body: '', attachments: [] },
  publishedAt: new Date().toISOString(),
}));

class Server extends FakeServer {
  items: FeedItem[] = [];

  init() {
    this.register('GET /api/feed', ({ url }) => {
      const type = url.searchParams.get('resourceType');
      const filtered = this.items.filter(([itemType]) => type === null || itemType === type);

      return this.json(filtered, { headers: { 'X-Pagination-Total': String(filtered.length) } });
    });
  }
}
