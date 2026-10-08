import { createAddress, createAuthenticatedMember, createMember, type Member } from '@sel/shared';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { MembersMapPage } from './members-map-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('members map', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);

    server.members = [
      createMember({
        id: 'claire',
        firstName: 'Claire',
        lastName: 'Dubois',
        address: createAddress({ city: 'Annecy', position: [6.12, 45.9] }),
      }),
      createMember({
        id: 'paul',
        firstName: 'Paul',
        lastName: 'Martin',
        address: createAddress({ city: 'Seynod', position: [6.09, 45.88] }),
      }),
      createMember({ id: 'anne', firstName: 'Anne', lastName: 'Morel' }),
    ];
  });

  it('shows a pin for each member with a position', async () => {
    renderPage(routes.membersMap());

    expect(await screen.findByRole('button', { name: 'Claire Dubois' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paul Martin' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anne Morel' })).not.toBeInTheDocument();
  });

  it("opens a member's popup with a link to their page", async () => {
    const user = userEvent.setup();

    renderPage(routes.membersMap());

    await user.click(await screen.findByRole('button', { name: 'Paul Martin' }));

    expect(await screen.findByRole('link', { name: 'Paul Martin' })).toHaveAttribute('href', '/members/paul');
  });

  it("opens the selected member's popup", async () => {
    renderPage(routes.membersMap('claire'));

    expect(await screen.findByRole('link', { name: 'Claire Dubois' })).toHaveAttribute(
      'href',
      '/members/claire',
    );
    expect(screen.queryByRole('link', { name: 'Paul Martin' })).not.toBeInTheDocument();
  });
});

function renderPage(path: string) {
  return renderTestPage(path, [
    { path: routes.membersMap(), middleware: [requireSession], Component: MembersMapPage },
  ]);
}

class Server extends FakeServer {
  members: Member[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));
    this.register('GET /api/members', () => this.json(this.members));
  }
}
