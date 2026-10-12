import { TransactionStatus, type LightMember, type Transaction } from '@sel/shared';
import { createAuthenticatedMember, createTransaction } from '@sel/shared/factories';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { PendingTransactionsCard } from './pending-transactions-card';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire: LightMember = { id: 'claire', number: 12, firstName: 'Claire', lastName: 'Dubois' };

describe('pending transactions card', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function render() {
    queryClient.setQueryData(queries.session().queryKey, me);

    renderTest(
      <MemoryRouter>
        <PendingTransactionsCard />
      </MemoryRouter>,
    );
  }

  it('is not shown without an exchange waiting for my approval', async () => {
    render();

    await vi.waitFor(() => expect(server.find('/api/members/me/transactions')).toHaveLength(1));

    expect(screen.queryByText('Pending exchanges')).not.toBeInTheDocument();
  });

  it('lists the exchanges waiting for my approval', async () => {
    server.transactions = [
      createTransaction({ status: TransactionStatus.pending, payer: me, recipient: claire }),
    ];

    render();

    expect(await screen.findByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument();

    const [url] = server.find('/api/members/me/transactions');

    expect(url?.searchParams.get('status')).toEqual('pending');
    expect(url?.searchParams.get('payerId')).toEqual('me');
  });

  it('shows three pending exchanges at most', async () => {
    server.transactions = Array.from({ length: 4 }, () =>
      createTransaction({ status: TransactionStatus.pending, payer: me, recipient: claire }),
    );

    render();

    expect(await screen.findAllByRole('button', { name: 'Accept' })).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'See the 4 pending exchanges' })).toHaveAttribute(
      'href',
      routes.member('me', 'exchanges'),
    );
  });
});

class Server extends FakeServer {
  transactions: Transaction[] = [];

  init() {
    this.register('GET /api/members/me/transactions', ({ url }) => {
      return this.json(this.paginate(this.transactions, url.searchParams), {
        headers: { 'X-Pagination-Total': String(this.transactions.length) },
      });
    });
  }
}
