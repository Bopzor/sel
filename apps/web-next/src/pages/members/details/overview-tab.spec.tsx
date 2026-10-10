import {
  createAuthenticatedMember,
  createMember,
  createMemberActivityItem,
  createTransaction,
  type Member,
  type MemberActivityCounts,
  type MemberActivityItem,
  type MemberTransactionStats,
  type Transaction,
} from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { MemberPage } from './member-page';

const me = createAuthenticatedMember({
  id: 'me',
  firstName: 'Jason',
  lastName: 'Talon',
  interests: [{ id: 'myCooking', interestId: 'cooking', label: 'Cooking' }],
});

describe('member overview', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it("shows the member's bio", async () => {
    server.member = createMember({ id: 'claire', firstName: 'Claire', bio: 'Hello,\nI like bread.' });

    renderPage(routes.member('claire'));

    const about = await screen.findByRole('region', { name: 'About' });

    expect(about).toHaveTextContent('Hello, I like bread.');
  });

  it('shows the interests in common first', async () => {
    server.member = createMember({
      id: 'claire',
      firstName: 'Claire',
      interests: [
        { id: 'gardening', interestId: 'gardening', label: 'Gardening', description: 'Vegetables' },
        { id: 'cooking', interestId: 'cooking', label: 'Cooking' },
      ],
    });

    renderPage(routes.member('claire'));

    const interests = await screen.findByRole('region', { name: 'Interests' });
    const [cooking, gardening] = within(interests).getAllByRole('listitem');

    expect(cooking).toHaveTextContent('Cooking');
    expect(cooking).toHaveTextContent('In common');
    expect(gardening).toHaveTextContent('Gardening');
    expect(gardening).toHaveTextContent('Vegetables');
    expect(gardening).not.toHaveTextContent('In common');
    expect(within(interests).queryByRole('button', { name: 'See more' })).not.toBeInTheDocument();
  });

  it('shows four interests, then the others once asked', async () => {
    const user = userEvent.setup();

    server.member = createMember({
      id: 'claire',
      interests: Array.from({ length: 6 }, (_, index) => ({
        id: `interest${index}`,
        interestId: `interest${index}`,
        label: `Interest ${index}`,
      })),
    });

    renderPage(routes.member('claire'));

    const interests = await screen.findByRole('region', { name: 'Interests' });

    expect(within(interests).getAllByRole('listitem')).toHaveLength(4);

    await user.click(within(interests).getByRole('button', { name: 'See more' }));

    expect(within(interests).getAllByRole('listitem')).toHaveLength(6);
    expect(within(interests).queryByRole('button', { name: 'See more' })).not.toBeInTheDocument();
  });

  it('collapses the empty sections', async () => {
    server.member = createMember({ id: 'claire', firstName: 'Claire' });

    renderPage(routes.member('claire'));

    expect(await screen.findByText("Claire hasn't written a bio yet.")).toBeInTheDocument();
    expect(screen.getByText("Claire hasn't shared any interest yet.")).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Write my bio' })).not.toBeInTheDocument();
  });

  it('invites me to fill my profile', async () => {
    server.member = createMember({ id: 'me', firstName: 'Jason' });

    renderPage(routes.member('me'));

    const about = await screen.findByRole('region', { name: 'About' });
    const interests = screen.getByRole('region', { name: 'Interests' });

    expect(about).toHaveTextContent("You haven't written a bio yet.");
    expect(interests).toHaveTextContent("You haven't shared any interest yet.");
    expect(within(about).getByRole('link', { name: 'Write my bio' })).toHaveAttribute(
      'href',
      routes.profile(),
    );
    expect(within(interests).getByRole('link', { name: 'Browse the interests' })).toHaveAttribute(
      'href',
      routes.interests(),
    );
  });

  it('summarizes the exchanges', async () => {
    server.member = createMember({ id: 'claire', balance: 12 });
    server.stats = { given: 30, received: 42, count: 9, partners: 4 };
    server.transactions = [createTransaction({ description: 'Bread', payer: server.member })];

    renderPage(routes.member('claire'));

    const card = await screen.findByRole('heading', { name: 'Exchanges', level: 2 });
    const exchanges = card.closest('div[class*="rounded-lg"]') as HTMLElement;

    expect(await within(exchanges).findByText('Received')).toBeInTheDocument();
    expect(getDefinition(exchanges, 'Balance')).toHaveTextContent('12');
    expect(getDefinition(exchanges, 'Exchanges')).toHaveTextContent('9');
    expect(within(exchanges).getByRole('listitem')).toHaveTextContent('Bread');

    const query = server.find('/api/members/claire/transactions').at(-1)?.searchParams;
    expect(query?.get('status')).toEqual('completed');
    expect(query?.get('pageSize')).toEqual('3');
    expect(within(exchanges).getByRole('link', { name: 'See exchanges' })).toHaveAttribute(
      'href',
      '/members/claire/exchanges',
    );
  });

  it('shows the three latest activities', async () => {
    server.member = createMember({ id: 'claire' });
    server.counts.requests = 5;
    server.items = Array.from({ length: 5 }, (_, index) =>
      createMemberActivityItem({
        entity: { type: 'request', id: `request${index}`, title: `Request ${index}` },
      }),
    );

    renderPage(routes.member('claire'));

    const card = await screen.findByRole('heading', { name: 'Activity', level: 2 });
    const activity = card.closest('div[class*="rounded-lg"]') as HTMLElement;

    expect(await within(activity).findByText('Request 0')).toBeInTheDocument();
    expect(within(activity).getAllByRole('listitem')).toHaveLength(3);
    expect(getDefinition(activity, 'Requests')).toHaveTextContent('5');
    expect(server.find('/api/members/claire/activity').at(-1)?.searchParams.get('pageSize')).toEqual('3');
    expect(within(activity).getByRole('link', { name: 'See activity' })).toHaveAttribute(
      'href',
      '/members/claire/activity',
    );
  });
});

function getDefinition(container: HTMLElement, label: string) {
  return within(container).getByText(label, { selector: 'dt' }).nextElementSibling;
}

function renderPage(path: string) {
  return renderTestPage(path, [
    { path: `${routes.member(':memberId')}/:tab?`, middleware: [requireSession], Component: MemberPage },
  ]);
}

class Server extends FakeServer {
  member: Member = createMember({ id: 'claire' });
  stats: MemberTransactionStats = { given: 0, received: 0, count: 0, partners: 0 };

  counts: MemberActivityCounts = {
    requests: 0,
    requestAnswers: 0,
    events: 0,
    eventParticipations: 0,
    information: 0,
    comments: 0,
  };

  items: MemberActivityItem[] = [];
  transactions: Transaction[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    for (const memberId of ['claire', 'me']) {
      this.register(`GET /api/members/${memberId}`, () => this.json(this.member));
      this.register(`GET /api/members/${memberId}/transactions/stats`, () => this.json(this.stats));
      this.register(`GET /api/members/${memberId}/transactions`, () => {
        return this.json(this.transactions, {
          headers: { 'X-Pagination-Total': String(this.transactions.length) },
        });
      });

      this.register(`GET /api/members/${memberId}/activity/counts`, () => this.json(this.counts));

      this.register(`GET /api/members/${memberId}/activity`, ({ url }) => {
        return this.json(this.paginate(this.items, url.searchParams), {
          headers: { 'X-Pagination-Total': String(this.items.length) },
        });
      });
    }
  }
}
