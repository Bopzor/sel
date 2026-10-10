import { createAuthenticatedMember, type CreateEventBody } from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { CreateEventPage } from './create-event-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('create event', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('creates the event and opens it', async () => {
    const router = renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Picnic at the lake');
    await user.type(screen.getByLabelText(/^Date and time/), '2026-10-12T18:30');
    await writeMessage(user, 'Bring something to share.');
    await user.click(screen.getByRole('button', { name: 'Create the event' }));

    expect(await screen.findByText('Event created')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(routes.event('e1'));

    expect(server.posted).toEqual([
      {
        title: 'Picnic at the lake',
        body: '<p>Bring something to share.</p>',
        fileIds: [],
        kind: 'internal',
        date: new Date('2026-10-12T18:30').toISOString(),
        location: null,
      },
    ]);
  });

  it('creates an outside event without a date', async () => {
    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Village fair');
    await user.click(screen.getByRole('radio', { name: 'Outside event' }));
    await writeMessage(user, 'The fair of the village.');
    await user.click(screen.getByRole('button', { name: 'Create the event' }));
    await screen.findByText('Event created');

    expect(server.posted[0]).toMatchObject({ kind: 'external', date: null });
  });

  it('does not focus the address search when the page opens', async () => {
    renderPage();

    expect(await screen.findByRole('searchbox', { name: /^Location/ })).not.toHaveFocus();
  });

  it('enters the location manually', async () => {
    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Picnic at the lake');
    await writeMessage(user, 'Bring something to share.');
    await user.click(screen.getByRole('button', { name: 'Manual entry' }));

    const dialog = await screen.findByRole('dialog', { name: 'Enter the address of the event' });

    await user.type(within(dialog).getByRole('textbox', { name: /^Number and street/ }), '1 chemin du Lac');
    await user.type(within(dialog).getByRole('textbox', { name: /^Postal code/ }), '74000');
    await user.type(within(dialog).getByRole('textbox', { name: /^City/ }), 'Annecy');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText(/1 chemin du Lac/)).toHaveTextContent('1 chemin du Lac 74000 Annecy');

    await user.click(screen.getByRole('button', { name: 'Create the event' }));
    await screen.findByText('Event created');

    expect(server.posted[0]?.location).toEqual({
      line1: '1 chemin du Lac',
      postalCode: '74000',
      city: 'Annecy',
      country: 'France',
    });
  });

  it('does not accept an incomplete location', async () => {
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Manual entry' }));

    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByRole('textbox', { name: /^Number and street/ }), '1 chemin du Lac');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await within(dialog).findByRole('textbox', { name: /^Postal code/ })).toHaveAccessibleErrorMessage(
      'This field is required',
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('discards the manual entry when the dialog is closed', async () => {
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Manual entry' }));
    await user.type(
      within(await screen.findByRole('dialog')).getByRole('textbox', { name: /^Number and street/ }),
      '1 chemin du Lac',
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Manual entry' }));

    expect(
      within(await screen.findByRole('dialog')).getByRole('textbox', { name: /^Number and street/ }),
    ).toHaveValue('');
  });

  describe('address search', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sets the location found by the search', async () => {
      renderPage();

      await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Picnic at the lake');
      await writeMessage(user, 'Bring something to share.');
      await user.type(screen.getByRole('searchbox', { name: /^Location/ }), '8 bd du port');
      await vi.advanceTimersByTimeAsync(1000);
      await user.click(await screen.findByRole('button', { name: '8 Boulevard du Port' }));

      expect(screen.getByText(/8 Boulevard du Port/)).toHaveTextContent('8 Boulevard du Port 80000 Amiens');

      await user.click(screen.getByRole('button', { name: 'Create the event' }));
      await screen.findByText('Event created');

      expect(server.posted[0]?.location).toEqual({
        line1: '8 Boulevard du Port',
        postalCode: '80000',
        city: 'Amiens',
        country: 'France',
        position: [2.290084, 49.897442],
      });
    });

    it('tells when no address is found', async () => {
      renderPage();

      await user.type(await screen.findByRole('searchbox', { name: /^Location/ }), 'nowhere');
      await vi.advanceTimersByTimeAsync(1000);

      expect(
        await screen.findByText('No address found. Check what you typed, or enter the address manually.'),
      ).toBeInTheDocument();
    });

    it('does not submit the event when Enter is pressed in the search', async () => {
      renderPage();

      await user.type(await screen.findByRole('searchbox', { name: /^Location/ }), '8 bd du port{Enter}');

      expect(screen.queryByText('This field should be at least 5 characters')).not.toBeInTheDocument();
    });
  });

  it('shows the errors under the fields', async () => {
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Create the event' }));

    expect(await screen.findByText('This field should be at least 5 characters')).toBeInTheDocument();
    expect(screen.getByText('This field should be at least 10 characters')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveFocus();
    expect(server.posted).toEqual([]);
  });

  it('shows an alert when the event could not be created, and keeps the form', async () => {
    server.failing = true;

    renderPage();

    await user.type(await screen.findByRole('textbox', { name: /^Title/ }), 'Picnic at the lake');
    await writeMessage(user, 'Bring something to share.');
    await user.click(screen.getByRole('button', { name: 'Create the event' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The event could not be created');
    expect(screen.getByRole('textbox', { name: /^Title/ })).toHaveValue('Picnic at the lake');
  });
});

// Typing key by key drops characters in happy-dom's contenteditable, a paste does not.
async function writeMessage(user: UserEvent, text: string) {
  await user.click(screen.getByRole('textbox', { name: /^Message/ }));
  await user.paste(text);
}

function renderPage() {
  return renderTestPage(routes.createEvent(), [
    { path: routes.createEvent(), middleware: [requireSession], Component: CreateEventPage },
    { path: routes.event(':eventId'), Component: () => null },
  ]);
}

const geocodingFeature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [2.290084, 49.897442] },
  properties: {
    id: '80021_6590_00008',
    type: 'housenumber',
    label: '8 Boulevard du Port 80000 Amiens',
    name: '8 Boulevard du Port',
    postcode: '80000',
    city: 'Amiens',
  },
};

class Server extends FakeServer {
  posted: CreateEventBody[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /geocodage/search', ({ url }) => {
      const features = url.searchParams.get('q') === '8 bd du port' ? [geocodingFeature] : [];

      return this.json({ type: 'FeatureCollection', features });
    });

    this.register('POST /api/events', ({ body }) => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      this.posted.push(body as CreateEventBody);

      return Promise.resolve(
        new Response('e1', { status: 201, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
      );
    });
  }
}
