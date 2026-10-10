import { createAuthenticatedMember, createTransaction, type Transaction } from '@sel/shared';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { PendingTransactionsAlert } from './pending-transactions-alert';

const me = createAuthenticatedMember({ id: 'me' });

describe('pending transactions alert', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function render(path: string = routes.home()) {
    queryClient.setQueryData(queries.session().queryKey, me);

    renderTest(
      <MemoryRouter initialEntries={[path]}>
        <PendingTransactionsAlert />
      </MemoryRouter>,
    );
  }

  it('shows the exchanges waiting for my approval', async () => {
    server.pending = [createTransaction(), createTransaction()];

    render();

    expect(await screen.findByText('2 exchanges are waiting for your approval')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See the pending exchanges' })).toHaveAttribute(
      'href',
      routes.member('me', 'exchanges'),
    );
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    const [url] = server.find('/api/members/me/transactions');

    expect(url?.searchParams.get('status')).toEqual('pending');
    expect(url?.searchParams.get('payerId')).toEqual('me');
  });

  it('is not shown without an exchange waiting for my approval', async () => {
    render();

    await vi.waitFor(() => expect(server.find('/api/members/me/transactions')).toHaveLength(1));

    expect(screen.queryByText(/waiting for your approval/)).not.toBeInTheDocument();
  });

  it('is not shown on my exchanges tab', async () => {
    server.pending = [createTransaction()];

    render(routes.member('me', 'exchanges'));

    await vi.waitFor(() => expect(server.find('/api/members/me/transactions')).toHaveLength(1));

    expect(screen.queryByText(/waiting for your approval/)).not.toBeInTheDocument();
  });
});

class Server extends FakeServer {
  pending: Transaction[] = [];

  init() {
    this.register('GET /api/members/me/transactions', ({ url }) => {
      return this.json(this.paginate(this.pending, url.searchParams), {
        headers: { 'X-Pagination-Total': String(this.pending.length) },
      });
    });
  }
}
