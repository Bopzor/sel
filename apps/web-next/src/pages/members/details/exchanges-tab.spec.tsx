import {
  createAuthenticatedMember,
  createMember,
  createTransaction,
  TransactionStatus,
  type Member,
  type MemberTransactionStats,
  type Transaction,
} from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { MemberPage } from './member-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon', balance: 10 });
const claire = createMember({ id: 'claire', firstName: 'Claire', lastName: 'Dubois', balance: 4 });
const julien = createMember({ id: 'julien', firstName: 'Julien', lastName: 'Petit' });

describe('member exchanges', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it("shows the member's balance and transaction stats", async () => {
    server.stats = { given: 12, received: 16, count: 5, partners: 3 };

    renderPage(routes.member('claire', 'exchanges'));

    expect(await screen.findByText('12 units')).toBeInTheDocument();
    expect(getDefinition('Balance')).toHaveTextContent('4 units');
    expect(getDefinition('Given')).toHaveTextContent('12 units');
    expect(getDefinition('Received')).toHaveTextContent('16 units');
    expect(getDefinition('Exchanges')).toHaveTextContent('5');
    expect(getDefinition('Partners')).toHaveTextContent('3');
  });

  it("lists the member's exchanges", async () => {
    server.transactions = [
      createTransaction({
        payer: claire,
        recipient: julien,
        amount: 3,
        description: 'Gardening',
        request: { id: 'requestId', title: 'Help in the garden' },
        payerComment: 'Thank you!',
        recipientComment: 'With pleasure',
      }),
      createTransaction({ payer: julien, recipient: claire, amount: 2, description: 'Bread' }),
    ];

    renderPage(routes.member('claire', 'exchanges'));

    await screen.findByText('Gardening');
    const [paid, received] = screen.getAllByRole('listitem');

    expect(within(paid!).getByRole('link', { name: 'Julien Petit' })).toHaveAttribute(
      'href',
      '/members/julien',
    );
    expect(paid).toHaveTextContent('− 3 units');
    expect(paid).toHaveTextContent('Gardening');
    expect(within(paid!).getByRole('link', { name: 'Help in the garden' })).toHaveAttribute(
      'href',
      '/requests/requestId',
    );
    expect(
      within(paid!)
        .getAllByRole('figure')
        .map((comment) => comment.textContent),
    ).toEqual(['Thank you!Claire Dubois', 'With pleasureJulien Petit']);

    expect(received).toHaveTextContent('+ 2 units');
    expect(server.find('/api/members/claire/transactions')[0]?.searchParams.get('status')).toEqual(
      'completed',
    );
  });

  it('lists the exchanges with me', async () => {
    server.transactions = [createTransaction({ payer: claire, recipient: julien })];

    renderPage(routes.member('claire', 'exchanges'));

    await user.click(await screen.findByRole('button', { name: 'With me' }));

    expect(await screen.findByRole('heading', { name: 'No exchanges with Claire yet' })).toBeInTheDocument();
    expect(server.find('/api/members/claire/transactions').at(-1)?.searchParams.get('counterpartId')).toEqual(
      'me',
    );

    await user.click(screen.getByRole('button', { name: 'Show all the exchanges' }));

    expect(await screen.findByRole('link', { name: 'Julien Petit' })).toBeInTheDocument();
  });

  it('tells when the member has no exchanges yet', async () => {
    renderPage(routes.member('claire', 'exchanges'));

    expect(await screen.findByRole('heading', { name: 'No exchanges yet' })).toBeInTheDocument();
    expect(screen.getByText("Claire's exchanges will appear here.")).toBeInTheDocument();
  });

  it("does not show the pending exchanges on another member's page", async () => {
    renderPage(routes.member('claire', 'exchanges'));

    await screen.findByRole('heading', { name: 'No exchanges yet' });

    expect(
      server.find('/api/members/claire/transactions').map((url) => url.searchParams.get('status')),
    ).toEqual(['completed']);
    expect(screen.queryByRole('heading', { name: 'Pending' })).not.toBeInTheDocument();
  });

  it('accepts a pending exchange on my own page', async () => {
    server.pending = [
      createTransaction({ id: 'pendingId', status: TransactionStatus.pending, payer: me, recipient: julien }),
    ];

    renderPage(routes.member('me', 'exchanges'));

    const pending = await screen.findByRole('region', { name: 'Pending' });

    expect(screen.queryByRole('button', { name: 'With me' })).not.toBeInTheDocument();

    await user.click(await within(pending).findByRole('button', { name: 'Accept' }));

    expect(await screen.findByText('Exchange accepted')).toBeInTheDocument();
    expect(server.accepted).toEqual(['pendingId']);
  });

  it('declines a pending exchange on my own page', async () => {
    server.pending = [
      createTransaction({ id: 'pendingId', status: TransactionStatus.pending, payer: me, recipient: julien }),
    ];

    renderPage(routes.member('me', 'exchanges'));

    const pending = await screen.findByRole('region', { name: 'Pending' });

    await user.click(await within(pending).findByRole('button', { name: 'Decline' }));

    expect(await screen.findByText('Exchange declined')).toBeInTheDocument();
    expect(server.canceled).toEqual(['pendingId']);
  });

  it('lists my canceled exchanges', async () => {
    server.transactions = [
      createTransaction({ payer: me, recipient: julien, description: 'Completed' }),
      createTransaction({
        status: TransactionStatus.canceled,
        payer: me,
        recipient: julien,
        amount: 3,
        description: 'Canceled',
      }),
    ];

    renderPage(routes.member('me', 'exchanges'));

    await screen.findByText('Completed');
    await user.click(screen.getByRole('button', { name: 'Canceled' }));

    const item = (await screen.findByText('Canceled', { selector: 'p' })).closest('li');

    expect(item).toHaveTextContent('3 units');
    expect(item).not.toHaveTextContent('− 3 units');
    expect(screen.queryByText('Completed', { selector: 'p' })).not.toBeInTheDocument();
  });

  it("does not show the canceled exchanges on another member's page", async () => {
    renderPage(routes.member('claire', 'exchanges') + '?canceled=true');

    await screen.findByRole('heading', { name: 'No exchanges yet' });

    expect(screen.queryByRole('button', { name: 'Canceled' })).not.toBeInTheDocument();
    expect(
      server.find('/api/members/claire/transactions').map((url) => url.searchParams.get('status')),
    ).toEqual(['completed']);
  });

  it('waits for the payer to confirm a pending exchange', async () => {
    server.pending = [createTransaction({ status: TransactionStatus.pending, payer: julien, recipient: me })];

    renderPage(routes.member('me', 'exchanges'));

    const pending = await screen.findByRole('region', { name: 'Pending' });

    expect(await within(pending).findByText('Waiting for Julien Petit to confirm')).toBeInTheDocument();
    expect(within(pending).queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
  });
});

function getDefinition(label: string) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling;
}

function renderPage(path: string) {
  return renderTestPage(path, [
    { path: `${routes.member(':memberId')}/:tab?`, middleware: [requireSession], Component: MemberPage },
  ]);
}

class Server extends FakeServer {
  stats: MemberTransactionStats = { given: 0, received: 0, count: 0, partners: 0 };
  transactions: Transaction[] = [];
  pending: Transaction[] = [];
  accepted: string[] = [];
  canceled: string[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    for (const member of [claire, me] as Member[]) {
      this.register(`GET /api/members/${member.id}`, () => this.json(member));
      this.register(`GET /api/members/${member.id}/transactions/stats`, () => this.json(this.stats));

      this.register(`GET /api/members/${member.id}/transactions`, ({ url }) => {
        const params = url.searchParams;
        const counterpartId = params.get('counterpartId');
        const filtered = [...this.pending, ...this.transactions].filter(
          ({ status, payer, recipient }) =>
            status === params.get('status') &&
            (!counterpartId || [payer.id, recipient.id].includes(counterpartId)),
        );

        return this.json(this.paginate(filtered, params), {
          headers: { 'X-Pagination-Total': String(filtered.length) },
        });
      });
    }

    this.register('PUT /api/transactions/pendingId/accept', () => {
      this.accepted.push('pendingId');
      return this.noContent();
    });

    this.register('PUT /api/transactions/pendingId/cancel', () => {
      this.canceled.push('pendingId');
      return this.noContent();
    });
  }
}
