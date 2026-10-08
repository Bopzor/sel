import { createAddress, createAuthenticatedMember, createMember, type Member } from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { MemberPage } from './member-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('member', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it("shows the member's identity", async () => {
    server.member = createClaire({
      number: 42,
      committeeMember: true,
      membershipStartDate: '2022-03-15T00:00:00.000Z',
    });

    renderPage(routes.member('claire'));

    expect(await screen.findByRole('heading', { level: 1, name: 'Claire Dubois' })).toBeInTheDocument();
    expect(screen.getByText('Member #42')).toBeInTheDocument();
    expect(screen.getByText('Committee member')).toBeInTheDocument();
    expect(screen.getByText(/^Member since March 2022/)).toBeInTheDocument();
  });

  it('shows the contact information made visible by the member', async () => {
    server.member = createClaire({ email: 'claire@domain.tld', phoneNumber: '0612345678' });

    renderPage(routes.member('claire'));

    const contact = await screen.findByRole('region', { name: 'Contact' });

    expect(within(contact).getByRole('link', { name: 'claire@domain.tld' })).toHaveAttribute(
      'href',
      'mailto:claire@domain.tld',
    );
    expect(within(contact).getByRole('link', { name: '06 12 34 56 78' })).toHaveAttribute(
      'href',
      'tel:0612345678',
    );

    await user.click(within(contact).getByRole('button', { name: 'Copy the phone number' }));

    expect(await navigator.clipboard.readText()).toEqual('0612345678');
    expect(await screen.findByText('Phone number copied')).toBeInTheDocument();
  });

  it('hides the contact section when there is nothing to show', async () => {
    server.member = createClaire();

    renderPage(routes.member('claire'));

    await screen.findByRole('heading', { level: 1, name: 'Claire Dubois' });

    expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Address' })).not.toBeInTheDocument();
  });

  it("shows the member's address with a link to the members map", async () => {
    server.member = createClaire({
      address: createAddress({
        line1: '1 rue des Lilas',
        postalCode: '74000',
        city: 'Annecy',
        country: 'France',
      }),
    });

    renderPage(routes.member('claire'));

    const address = await screen.findByRole('region', { name: 'Address' });

    expect(address).toHaveTextContent('1 rue des Lilas 74000 Annecy');
    expect(within(address).getByRole('link', { name: 'Show on the members map' })).toHaveAttribute(
      'href',
      '/members/map?memberId=claire',
    );
  });

  it("shows the member's address on a map", async () => {
    server.member = createClaire({
      address: createAddress({ line1: '1 rue des Lilas', city: 'Annecy', position: [6.12, 45.9] }),
    });

    renderPage(routes.member('claire'));

    const address = await screen.findByRole('region', { name: 'Address' });

    await user.click(within(address).getByRole('button', { name: 'Show the map' }));

    expect(await within(address).findByRole('link', { name: 'OpenStreetMap' })).toBeInTheDocument();
  });

  it('opens the exchange dialog with the member as counterpart', async () => {
    server.member = createClaire();

    renderPage(routes.member('claire'));

    await user.click(await screen.findByRole('button', { name: 'Exchange units' }));

    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('group', { name: 'What do you want to do?' })).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Claire Dubois');
  });

  it('links to the profile on my own page', async () => {
    server.member = createMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

    renderPage(routes.member('me'));

    expect(await screen.findByRole('link', { name: 'Edit my profile' })).toHaveAttribute('href', '/profile');
    expect(screen.queryByRole('button', { name: 'Exchange units' })).not.toBeInTheDocument();
  });

  it('tells when the member does not exist', async () => {
    renderPage(routes.member('claire'));

    expect(await screen.findByRole('heading', { level: 1, name: 'Member not found' })).toBeInTheDocument();
  });

  it('tells when the person is no longer a member', async () => {
    server.inactive = true;

    renderPage(routes.member('claire'));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This person is no longer a member' }),
    ).toBeInTheDocument();
  });

  it('selects the tab from the URL', async () => {
    server.member = createClaire();

    renderPage(routes.member('claire', 'exchanges'));

    const tabs = await screen.findByRole('tablist', { name: 'Member sections' });

    expect(within(tabs).getByRole('tab', { name: 'Overview' })).toHaveAttribute('href', '/members/claire');
    expect(within(tabs).getByRole('tab', { name: 'Activity' })).toHaveAttribute(
      'href',
      '/members/claire/activity',
    );
    expect(within(tabs).getByRole('tab', { name: 'Exchanges' })).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates between the tabs', async () => {
    server.member = createClaire();

    const router = renderPage(routes.member('claire'));

    await user.click(await screen.findByRole('tab', { name: 'Activity' }));

    expect(router.state.location.pathname).toEqual('/members/claire/activity');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
  });

  it('redirects an unknown tab to the overview', async () => {
    server.member = createClaire();

    const router = renderPage('/members/claire/unknown');

    expect(await screen.findByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(router.state.location.pathname).toEqual('/members/claire');
  });
});

function createClaire(overrides: Partial<Member> = {}) {
  return createMember({ id: 'claire', firstName: 'Claire', lastName: 'Dubois', ...overrides });
}

function renderPage(path: string) {
  return renderTestPage(path, [
    { path: `${routes.member(':memberId')}/:tab?`, middleware: [requireSession], Component: MemberPage },
  ]);
}

class Server extends FakeServer {
  member: Member | undefined;
  inactive = false;

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/members/claire', () => (this.member ? this.json(this.member) : this.notFound()));
    this.register('GET /api/members/me', () => (this.member ? this.json(this.member) : this.notFound()));
  }

  private notFound() {
    if (this.inactive) {
      return this.json({ error: 'Member is no longer active', code: 'MemberInactive' }, { status: 404 });
    }

    return this.json({ error: 'Member not found' }, { status: 404 });
  }
}
