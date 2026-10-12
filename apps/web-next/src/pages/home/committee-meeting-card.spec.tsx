import { EventKind, type EventsListItem, type LightMember } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { CommitteeMeetingCard } from './committee-meeting-card';

const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('committee meeting card', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function render() {
    renderTest(
      <MemoryRouter>
        <CommitteeMeetingCard />
      </MemoryRouter>,
    );
  }

  it('is not shown without an upcoming committee meeting', async () => {
    render();

    await vi.waitFor(() => expect(server.find('/api/events')).toHaveLength(1));

    expect(screen.queryByText('Next committee meeting')).not.toBeInTheDocument();
  });

  it('shows the date and the location of the next committee meeting', async () => {
    server.events = [
      createEvent({
        id: 'meetingId',
        date: '2026-10-13T16:15:00.000Z',
        location: { line1: '12 rue des Lilas', postalCode: '84300', city: 'Cavaillon', country: 'France' },
      }),
    ];

    render();

    expect(await screen.findByText(/Tuesday, October 13, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/12 rue des Lilas/)).toHaveTextContent('84300 Cavaillon');
    expect(screen.getByRole('link', { name: 'Next committee meeting' })).toHaveAttribute(
      'href',
      routes.event('meetingId'),
    );

    const [url] = server.find('/api/events');

    expect(url?.searchParams.get('timing')).toEqual('upcoming');
    expect(url?.searchParams.get('committeeMeeting')).toEqual('true');
    expect(url?.searchParams.get('pageSize')).toEqual('1');
  });
});

let nextId = 1;

const createEvent = createFactory<EventsListItem>(() => ({
  id: `e${nextId++}`,
  title: '',
  kind: EventKind.internal,
  committeeMeeting: true,
  organizer: claire,
  message: { body: '', attachments: [] },
  participantsCount: 0,
}));

class Server extends FakeServer {
  events: EventsListItem[] = [];

  init() {
    this.register('GET /api/events', () => {
      return this.json(this.events, { headers: { 'X-Pagination-Total': String(this.events.length) } });
    });
  }
}
