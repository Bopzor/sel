import { RequestStatus, type FeedItem } from '@sel/shared';
import {
  createAddress,
  createFeedEvent,
  createFeedInformation,
  createFeedRequest,
} from '@sel/shared/factories';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { claire } from 'src/tests/fixtures';
import { renderTest } from 'src/tests/test-page';

import { Feed } from './feed';

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
      ['request', createFeedRequest({ id: 'requestId', title: 'Borrow a ladder' })],
      ['event', createFeedEvent({ id: 'eventId', title: 'Picnic' })],
      ['information', createFeedInformation({ id: 'informationId', title: 'New members', author: claire })],
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
      ['request', createFeedRequest({ title: 'Borrow a ladder', status: RequestStatus.fulfilled })],
    ];

    render();

    expect(within(await findCard('Borrow a ladder')).getByText('Fulfilled')).toBeInTheDocument();
  });

  it('shows the date of an event', async () => {
    server.items = [
      ['event', createFeedEvent({ title: 'Picnic', date: '2026-06-01T10:00:00.000Z' })],
      ['event', createFeedEvent({ title: 'Repair café', date: undefined })],
    ];

    render();

    expect(within(await findCard('Picnic')).getByText(/June 1, 2026/)).toBeInTheDocument();
    expect(within(await findCard('Repair café')).getByText(/Date to be decided/)).toBeInTheDocument();
  });

  it('separates the details of an event, with or without location', async () => {
    server.items = [
      [
        'event',
        createFeedEvent({ title: 'Picnic', date: undefined, location: createAddress({ city: 'Paris' }) }),
      ],
      ['event', createFeedEvent({ title: 'Repair café', date: undefined, location: undefined })],
    ];

    render();

    expect(await findCard('Picnic')).toHaveTextContent(/Event • Date to be decided • Paris$/);
    expect(await findCard('Repair café')).toHaveTextContent(/Event • Date to be decided$/);
  });

  it('shows the LETS as the author of an information without author', async () => {
    server.items = [['information', createFeedInformation({ title: 'General assembly', author: undefined })]];

    render();

    expect(within(await findCard('General assembly')).getByText('Lets Test')).toBeInTheDocument();
  });

  it('filters the publications by type', async () => {
    server.items = [['event', createFeedEvent({ title: 'Picnic' })]];

    render();

    await findCard('Picnic');
    await userEvent.click(screen.getByRole('button', { name: 'Events' }));

    await vi.waitFor(() => {
      expect(server.find('/api/feed').at(-1)?.searchParams.get('resourceType')).toEqual('event');
    });
  });

  it('searches the publications', async () => {
    server.items = [['event', createFeedEvent({ title: 'Picnic' })]];

    render();

    await findCard('Picnic');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search publications' }), 'picnic');

    await vi.waitFor(() => {
      expect(server.find('/api/feed').at(-1)?.searchParams.get('search')).toEqual('picnic');
    });
  });

  it('offers to clear the filters when no publication matches them', async () => {
    server.items = [['event', createFeedEvent({ title: 'Picnic' })]];

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
