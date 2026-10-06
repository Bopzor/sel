import {
  createAuthenticatedMember,
  EventKind,
  type Event,
  type LightMember,
  type UpdateEventBody,
} from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { EditEventPage } from './edit-event-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

const date = new Date(2026, 9, 12, 18, 30);

describe('edit event', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('fills the form with the event', async () => {
    server.event = createEvent();

    renderPage();

    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue('Picnic at the lake');
    expect(screen.getByLabelText(/^Date and time/)).toHaveValue('2026-10-12T18:30');
    expect(screen.getByRole('radio', { name: 'Outside event' })).toBeChecked();
    expect(screen.getByText(/1 chemin du Lac/)).toHaveTextContent('1 chemin du Lac 74000 Annecy');
    expect(screen.getByRole('textbox', { name: /^Message/ })).toHaveTextContent('Bring something to share.');
  });

  it('saves the changes and opens the event', async () => {
    server.event = createEvent();

    const router = renderPage();

    const title = await screen.findByRole('textbox', { name: /^Title/ });
    await user.clear(title);
    await user.type(title, 'Picnic at the beach');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));

    expect(await screen.findByText('Event edited')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(routes.event('e1'));

    expect(server.updated).toEqual([
      {
        title: 'Picnic at the beach',
        body: '<p>Bring something to share.</p>',
        fileIds: ['f1'],
        kind: 'external',
        date: date.toISOString(),
        location: { line1: '1 chemin du Lac', postalCode: '74000', city: 'Annecy', country: 'France' },
      },
    ]);
  });

  it('removes the date and the location', async () => {
    server.event = createEvent();

    renderPage();

    await user.clear(await screen.findByLabelText(/^Date and time/));
    await user.click(screen.getByRole('button', { name: 'Remove the location' }));
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    await screen.findByText('Event edited');

    expect(server.updated[0]).toMatchObject({ date: null, location: null });
  });

  it('edits the location manually, from the current one', async () => {
    server.event = createEvent();

    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('searchbox', { name: /^Location/ })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Manual entry' }));

    const dialog = await screen.findByRole('dialog');
    const line1 = within(dialog).getByRole('textbox', { name: /^Number and street/ });

    expect(line1).toHaveValue('1 chemin du Lac');

    await user.clear(line1);
    await user.type(line1, '3 chemin du Lac');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    await screen.findByText('Event edited');

    expect(server.updated[0]?.location).toEqual({
      line1: '3 chemin du Lac',
      postalCode: '74000',
      city: 'Annecy',
      country: 'France',
    });
  });

  it('keeps the location when its edition is canceled', async () => {
    server.event = createEvent();

    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText(/1 chemin du Lac/)).toHaveTextContent('1 chemin du Lac 74000 Annecy');
  });

  it('does not let another member edit the event', async () => {
    server.event = createEvent({ organizer: claire });

    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This event cannot be edited' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /^Title/ })).not.toBeInTheDocument();
  });

  it('shows the page not found when the event does not exist', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Event not found' })).toBeInTheDocument();
  });
});

function renderPage() {
  return renderTestPage(routes.editEvent('e1'), [
    { path: routes.editEvent(':eventId'), middleware: [requireSession], Component: EditEventPage },
    { path: routes.event(':eventId'), Component: () => null },
  ]);
}

class Server extends FakeServer {
  event: Event | undefined;
  updated: UpdateEventBody[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/events/e1', () => {
      if (!this.event) {
        return this.json({ error: 'Event not found' }, { status: 404 });
      }

      return this.json(this.event);
    });

    this.register('PUT /api/events/e1', ({ body }) => {
      this.updated.push(body as UpdateEventBody);

      return this.noContent();
    });
  }
}

const createEvent = createFactory<Event>(() => ({
  id: 'e1',
  title: 'Picnic at the lake',
  kind: EventKind.external,
  date: date.toISOString(),
  location: { line1: '1 chemin du Lac', postalCode: '74000', city: 'Annecy', country: 'France' },
  organizer: me,
  message: {
    body: '<p>Bring something to share.</p>',
    attachments: [{ fileId: 'f1', name: 'map.png', originalName: 'map.png', mimetype: 'image/png' }],
  },
  participants: [],
}));
