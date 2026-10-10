import {
  createAuthenticatedMember,
  EventKind,
  type Event,
  type LightMember,
  type SendEventNotificationBody,
  type SetEventParticipationBody,
} from '@sel/shared';
import { addDuration, assert, createFactory, defined } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { EventPage } from './event-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };
const julien: LightMember = { id: 'julien', number: 13, firstName: 'Julien', lastName: 'Petit' };

const nextWeek = addDuration(new Date(), { days: 7 });

describe('event', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows the event', async () => {
    server.event = createEvent({
      title: 'Picnic at the lake',
      date: '2026-10-12T16:30:00.000Z',
      location: { line1: '1 chemin du Lac', postalCode: '74000', city: 'Annecy', country: 'France' },
      message: { body: '<p>Bring something to share.</p>', attachments: [] },
    });

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Picnic at the lake' })).toBeInTheDocument();
    expect(screen.getByText('Bring something to share.')).toBeInTheDocument();
    expect(screen.getByText(/1 chemin du Lac/)).toHaveTextContent('1 chemin du Lac 74000 Annecy');
    expect(screen.getByRole('heading', { name: 'Claire Dubois' })).toBeInTheDocument();

    const date = document.querySelector('time');
    assert(date !== null);

    expect(date).toHaveAttribute('datetime', '2026-10-12T16:30:00.000Z');
    expect(date.textContent).toMatch(/^Monday, October 12/);
  });

  it('tells when the date and the location are not defined', async () => {
    server.event = createEvent({ date: undefined, location: undefined });

    renderPage();

    expect(await screen.findByText('Date to be defined')).toBeInTheDocument();
    expect(screen.getByText('Location to be defined')).toBeInTheDocument();
  });

  it('shows the outside events', async () => {
    server.event = createEvent({ kind: EventKind.external });

    renderPage();

    expect(await screen.findByText('Outside event')).toBeInTheDocument();
  });

  it('lists the participants who are coming', async () => {
    server.event = createEvent({
      participants: [
        { ...claire, participation: 'yes' },
        { ...julien, participation: 'no' },
      ],
    });

    renderPage();

    const section = await findSection('1 participant');

    expect(within(section).getByRole('link', { name: 'Claire Dubois' })).toBeInTheDocument();
    expect(within(section).queryByText('Julien Petit')).not.toBeInTheDocument();
  });

  it('shows the page not found when the event does not exist', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Event not found' })).toBeInTheDocument();
  });

  describe('participation', () => {
    it('tells the organizer that the member is coming', async () => {
      server.event = createEvent();

      renderPage();

      await user.click(await screen.findByRole('button', { name: "I'm coming" }));

      expect(await screen.findByRole('heading', { name: 'You are coming' })).toBeInTheDocument();
      expect(server.participations).toEqual(['yes']);
      expect(await findSection('1 participant')).toContainOneByText('Jason Talon');
    });

    it('changes the answer', async () => {
      server.event = createEvent({ participants: [{ ...me, participation: 'yes' }] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: "I can't come anymore" }));

      expect(await screen.findByRole('heading', { name: 'You are not coming' })).toBeInTheDocument();
      expect(server.participations).toEqual(['no']);
    });

    it('withdraws the answer', async () => {
      server.event = createEvent({ participants: [{ ...me, participation: 'no' }] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Withdraw my answer' }));

      expect(await screen.findByRole('heading', { name: 'Are you coming?' })).toBeInTheDocument();
      expect(server.participations).toEqual([null]);
    });

    it('does not ask about a past event', async () => {
      server.event = createEvent({ date: addDuration(new Date(), { days: -1 }).toISOString() });

      renderPage();

      expect(await screen.findByText('Past event')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Are you coming?' })).not.toBeInTheDocument();
    });

    it('lets the organizer answer', async () => {
      server.event = createEvent({ organizer: me });

      renderPage();

      expect(await screen.findByRole('heading', { name: 'Are you coming?' })).toBeInTheDocument();
    });
  });

  describe('organizer', () => {
    it('offers the organizer to edit the event', async () => {
      server.event = createEvent({ organizer: me });

      renderPage();

      expect(await screen.findByRole('link', { name: 'Edit' })).toHaveAttribute(
        'href',
        routes.editEvent('e1'),
      );
    });

    it('does not offer the actions to the other members', async () => {
      server.event = createEvent();

      renderPage();

      await screen.findByRole('heading', { level: 1 });

      expect(screen.queryByRole('heading', { name: 'Your event' })).not.toBeInTheDocument();
    });

    it('notifies the participants', async () => {
      server.event = createEvent({ organizer: me, participants: [{ ...claire, participation: 'yes' }] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Notify the members' }));

      const dialog = await screen.findByRole('dialog');

      expect(within(dialog).getByRole('radio', { name: 'The participants (1)' })).toBeChecked();

      await user.type(within(dialog).getByRole('textbox', { name: /^Title/ }), 'New meeting point');
      await user.type(within(dialog).getByRole('textbox', { name: /^Message/ }), 'We meet at the station.');
      await user.click(within(dialog).getByRole('radio', { name: 'All the members' }));
      await user.click(within(dialog).getByRole('button', { name: 'Send' }));

      expect(await screen.findByText('Notification sent')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      expect(server.notifications).toEqual([
        { recipients: 'all', title: 'New meeting point', content: 'We meet at the station.' },
      ]);
    });

    it('shows the errors of the notification', async () => {
      server.event = createEvent({ organizer: me });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Notify the members' }));
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Send' }));

      expect(await screen.findAllByText('This field should be at least 5 characters')).toHaveLength(2);
      expect(server.notifications).toEqual([]);
    });
  });
});

function renderPage() {
  return renderTestPage(routes.event('e1'), [
    { path: routes.event(':eventId'), middleware: [requireSession], Component: EventPage },
  ]);
}

async function findSection(heading: string) {
  const title = await screen.findByRole('heading', { name: heading });
  const section = title.closest('section');

  assert(section !== null);

  return section;
}

class Server extends FakeServer {
  event: Event | undefined;
  participations: unknown[] = [];
  notifications: SendEventNotificationBody[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/events/e1', () => {
      if (!this.event) {
        return this.json({ error: 'Event not found' }, { status: 404 });
      }

      return this.json(this.event);
    });

    this.register('GET /api/comment', () => this.json([]));

    this.register('PUT /api/events/e1/participation', ({ body }) => {
      const event = defined(this.event);
      const { participation } = body as SetEventParticipationBody;

      this.participations.push(participation);

      event.participants = event.participants.filter(({ id }) => id !== me.id);

      if (participation !== null) {
        event.participants.push({ ...me, participation });
      }

      return this.noContent();
    });

    this.register('POST /api/events/e1/notify', ({ body }) => {
      this.notifications.push(body as SendEventNotificationBody);

      return this.noContent();
    });
  }
}

const createEvent = createFactory<Event>(() => ({
  id: 'e1',
  title: 'Event',
  kind: EventKind.internal,
  date: nextWeek.toISOString(),
  organizer: claire,
  message: { body: '', attachments: [] },
  participants: [],
}));
