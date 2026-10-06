import { createAuthenticatedMember, type Member } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { MembersPage } from './members-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

const longAgo = new Date('2020-01-01').toISOString();

describe('members', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('lists the members', async () => {
    server.members = [
      createMember({
        id: 'claire',
        firstName: 'Claire',
        lastName: 'Dubois',
        bio: 'I love gardening.',
        membershipStartDate: longAgo,
      }),
    ];

    renderPage(routes.members());

    const [item] = await findItems();

    expect(within(item).getByRole('link', { name: 'Claire Dubois' })).toHaveAttribute('href', '/members/claire');
    expect(item).toHaveTextContent('I love gardening.');
    expect(item).not.toHaveTextContent('New');
  });

  it('shows the members who joined recently', async () => {
    server.members = [createMember({ firstName: 'Claire', membershipStartDate: new Date().toISOString() })];

    renderPage(routes.members());

    const [item] = await findItems();

    expect(item).toHaveTextContent('New');
  });

  it('searches the members by name', async () => {
    const user = userEvent.setup();

    server.members = [
      createMember({ firstName: 'Hélène', lastName: 'Dubois' }),
      createMember({ firstName: 'Paul', lastName: 'Martin' }),
    ];

    const router = renderPage(routes.members());

    await findItems();
    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), 'helene');

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Hélène Dubois' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?search=helene');
  });

  it('searches the members by email', async () => {
    const user = userEvent.setup();

    server.members = [
      createMember({ firstName: 'Claire', lastName: 'Dubois', email: 'claire@example.com' }),
      createMember({ firstName: 'Paul', lastName: 'Martin', email: 'paul@example.com' }),
    ];

    renderPage(routes.members());

    await findItems();
    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), 'claire@');

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Claire Dubois' })).toBeInTheDocument();
  });

  it('searches the members by phone number', async () => {
    const user = userEvent.setup();

    server.members = [
      createMember({ firstName: 'Claire', lastName: 'Dubois', phoneNumber: '0612345678' }),
      createMember({ firstName: 'Paul', lastName: 'Martin', phoneNumber: '0698765432' }),
    ];

    renderPage(routes.members());

    await findItems();
    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), '0612');

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Claire Dubois' })).toBeInTheDocument();
  });

  it('sorts the members', async () => {
    const user = userEvent.setup();

    server.members = [createMember({ firstName: 'Claire' })];

    const router = renderPage(routes.members());

    await findItems();

    expect(server.find('/api/members').at(-1)?.searchParams.get('sort')).toBe('firstName');

    await user.click(screen.getByRole('button', { name: 'Newest' }));

    await vi.waitFor(() => {
      expect(server.find('/api/members').at(-1)?.searchParams.get('sort')).toBe('membershipDate');
    });

    expect(screen.getByRole('button', { name: 'Newest' })).toHaveAttribute('aria-pressed', 'true');
    expect(router.state.location.search).toBe('?sort=membershipDate');
  });

  it('clears the search when no member matches it', async () => {
    const user = userEvent.setup();

    server.members = [createMember({ firstName: 'Claire' })];

    const router = renderPage(`${routes.members()}?search=paul`);

    await user.click(await screen.findByRole('button', { name: 'Clear the search' }));

    await findItems();

    expect(router.state.location.search).toBe('');
    expect(screen.getByRole('searchbox', { name: 'Search members' })).toHaveValue('');
  });

  it('retries when the members fail to load', async () => {
    const user = userEvent.setup();

    server.members = [createMember({ firstName: 'Claire' })];
    server.failing = true;

    renderPage(routes.members());

    await screen.findByText('Unable to load the members');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await findItems();
  });
});

let nextId = 1;

const createMember = createFactory<Member>(() => ({
  id: `m${nextId}`,
  firstName: '',
  lastName: '',
  number: nextId++,
  membershipStartDate: longAgo,
  balance: 0,
  interests: [],
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
  return renderTestPage(path, [{ path: routes.members(), middleware: [requireSession], Component: MembersPage }]);
}

class Server extends FakeServer {
  members: Member[] = [];
  failing = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/members', () => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      return this.json(this.members);
    });
  }
}
