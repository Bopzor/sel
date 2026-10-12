import { type EventsListItem } from '@sel/shared';
import { createAddress, createEventsListItem } from '@sel/shared/factories';
import { screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { UpcomingEventsCard } from './upcoming-events-card';

describe('upcoming events card', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function render() {
    renderTest(
      <MemoryRouter>
        <UpcomingEventsCard />
      </MemoryRouter>,
    );
  }

  it('is not shown without an upcoming event', async () => {
    render();

    await vi.waitFor(() => expect(server.find('/api/events')).toHaveLength(1));

    expect(screen.queryByText('Upcoming events')).not.toBeInTheDocument();
  });

  it('lists the next two events of the coming week', async () => {
    server.events = [
      createEventsListItem({
        id: 'picnicId',
        title: 'Picnic',
        date: '2026-06-01T10:00:00.000Z',
        location: createAddress({ city: 'Cavaillon' }),
      }),
      createEventsListItem({ title: 'Repair café', date: '2026-06-08T10:00:00.000Z' }),
    ];

    render();

    const link = await screen.findByRole('link', { name: 'Picnic' });

    expect(link).toHaveAttribute('href', routes.event('picnicId'));
    expect(within(link.closest('li')!).getByText(/June 1, 2026/)).toBeInTheDocument();
    expect(link.closest('li')).toHaveTextContent('Cavaillon');
    expect(screen.getByRole('link', { name: 'Repair café' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all events' })).toHaveAttribute('href', routes.events());

    const [url] = server.find('/api/events');

    expect(url?.searchParams.get('timing')).toEqual('upcoming');
    expect(url?.searchParams.get('pageSize')).toEqual('2');
    expect(url?.searchParams.get('committeeMeeting')).toEqual('false');

    const inSevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const before = new Date(url?.searchParams.get('before') ?? '').getTime();

    expect(Math.abs(before - inSevenDays)).toBeLessThan(60 * 1000);
  });
});

class Server extends FakeServer {
  events: EventsListItem[] = [];

  init() {
    this.register('GET /api/events', () => {
      return this.json(this.events, { headers: { 'X-Pagination-Total': String(this.events.length) } });
    });
  }
}
