import { createAuthenticatedMember, EventKind, type EventsListItem, type LightMember } from '@sel/shared';
import { addDuration, createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { EventsPage } from './events-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('events', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('lists the upcoming events, with the undated ones', async () => {
    server.items = [
      createEvent({
        id: 'e1',
        title: 'Picnic at the lake',
        date: new Date('2026-05-14T18:30').toISOString(),
        location: { line1: '1 chemin du Lac', postalCode: '74000', city: 'Annecy', country: 'France' },
        message: { body: '<p>Bring something to share.</p>', attachments: [] },
        participantsCount: 3,
      }),
      createEvent({ id: 'e2', title: 'Village fair', date: undefined }),
    ];

    renderPage(routes.events());

    const [item, undated] = await findItems();

    expect(within(item).getByRole('link', { name: 'Picnic at the lake' })).toHaveAttribute(
      'href',
      '/events/e1',
    );
    expect(item).toHaveTextContent('Bring something to share.');
    expect(item).toHaveTextContent(/May 14, 2026 6:30 PM/);
    expect(item).toHaveTextContent('Annecy');
    expect(item).toHaveTextContent('3 participants');

    expect(within(undated).getByRole('link', { name: 'Village fair' })).toHaveAttribute('href', '/events/e2');
    expect(undated).toHaveTextContent('Date to be defined');

    const [request] = server.find('/api/events');

    expect(request?.searchParams.get('timing')).toBe('upcoming');
    expect(request?.searchParams.get('includeUndated')).toBe('true');
  });

  it('tells when the date of an event is not defined', async () => {
    server.items = [createEvent({ date: undefined })];

    renderPage(routes.events());

    const [item] = await findItems();

    expect(item).toHaveTextContent('Date to be defined');
  });

  it('shows the events the member is coming to, and the outside events', async () => {
    server.items = [
      createEvent({ title: 'Picnic', participation: 'yes' }),
      createEvent({ title: 'Village fair', kind: EventKind.external, participation: 'no' }),
    ];

    renderPage(routes.events());

    const [picnic, fair] = await findItems();

    expect(picnic).toHaveTextContent('Coming');
    expect(picnic).not.toHaveTextContent('Outside event');
    expect(fair).toHaveTextContent('Outside event');
    expect(fair).not.toHaveTextContent('Coming');
  });

  it('lists the past events and all the events', async () => {
    const user = userEvent.setup();

    const router = renderPage(routes.events());

    await screen.findByText('No upcoming events');
    await user.click(screen.getByRole('button', { name: 'Past' }));
    await screen.findByText('No event matches these filters');

    expect(router.state.location.search).toBe('?timing=past');
    expect(server.find('/api/events').at(-1)?.searchParams.get('timing')).toBe('past');
    expect(server.find('/api/events').at(-1)?.searchParams.has('includeUndated')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'All' }));

    await vi.waitFor(() => expect(router.state.location.search).toBe('?timing=all'));
    expect(server.find('/api/events').at(-1)?.searchParams.has('timing')).toBe(false);
  });

  it('reads the filters from the URL', async () => {
    renderPage(`${routes.events()}?timing=past&mine=true&going=true&search=picnic`);

    await screen.findByText('No event matches these filters');

    const [request] = server.find('/api/events');

    expect(request?.searchParams.get('timing')).toBe('past');
    expect(request?.searchParams.get('organizerId')).toBe(me.id);
    expect(request?.searchParams.get('participantId')).toBe(me.id);
    expect(request?.searchParams.get('search')).toBe('picnic');

    expect(screen.getByRole('button', { name: 'Past' })).toBePressed();
    expect(screen.getByRole('button', { name: 'My events' })).toBePressed();
    expect(screen.getByRole('button', { name: "I'm coming" })).toBePressed();
    expect(screen.getByRole('searchbox', { name: 'Search the events' })).toHaveValue('picnic');
  });

  it('invites to create an event when there is none', async () => {
    renderPage(routes.events());

    await screen.findByText('No upcoming events');

    expect(screen.getByRole('link', { name: 'Create an event' })).toHaveAttribute(
      'href',
      routes.createEvent(),
    );
  });

  it('shows more events', async () => {
    const user = userEvent.setup();

    server.items = Array.from({ length: 12 }, (_, index) => createEvent({ title: `Event ${index + 1}` }));

    renderPage(routes.events());

    expect(await findItems()).toHaveLength(10);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 10 of 12 events');

    await user.click(screen.getByRole('button', { name: 'Show more' }));

    await vi.waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(12));

    expect(screen.getByRole('status')).toHaveTextContent(/^12 events$/);
  });

  it('retries when the events fail to load', async () => {
    const user = userEvent.setup();

    server.failing = true;
    server.items = [createEvent({ title: 'Picnic' })];

    renderPage(routes.events());

    await screen.findByText('Unable to load the events');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('link', { name: 'Picnic' })).toBeInTheDocument();
  });
});

let nextId = 1;

const createEvent = createFactory<EventsListItem>(() => ({
  id: `e${nextId++}`,
  title: '',
  kind: EventKind.internal,
  organizer: claire,
  date: addDuration(new Date(), { days: 7 }).toISOString(),
  message: { body: '', attachments: [] },
  participantsCount: 0,
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
    { path: routes.events(), middleware: [requireSession], Component: EventsPage },
  ]);
}

class Server extends FakeServer {
  items: EventsListItem[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/events', ({ url }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const params = url.searchParams;
      const search = params.get('search')?.toLowerCase();

      const filtered = this.items.filter((event) => {
        if (params.get('timing') === 'past') return false;
        if (params.has('organizerId') && event.organizer.id !== params.get('organizerId')) return false;
        if (search && !event.title.toLowerCase().includes(search)) return false;
        return true;
      });

      return this.json(this.paginate(filtered, params), {
        headers: { 'X-Pagination-Total': String(filtered.length) },
      });
    });
  }
}
