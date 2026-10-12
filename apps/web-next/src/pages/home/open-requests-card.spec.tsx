import { createAuthenticatedMember, RequestStatus, type RequestListItem } from '@sel/shared';
import { createFactory } from '@sel/utils';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { routes } from 'src/app/routes';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { OpenRequestsCard } from './open-requests-card';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });

describe('open requests card', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function render() {
    queryClient.setQueryData(queries.session().queryKey, me);

    renderTest(
      <MemoryRouter>
        <OpenRequestsCard />
      </MemoryRouter>,
    );
  }

  it('is not shown without an open request', async () => {
    render();

    await vi.waitFor(() => expect(server.find('/api/requests')).toHaveLength(1));

    expect(screen.queryByText('Your open requests')).not.toBeInTheDocument();
  });

  it('lists my open requests with their number of positive answers', async () => {
    server.openRequests = [
      createRequest({ id: 'answered', title: 'Borrow a ladder', positiveAnswersCount: 2 }),
      createRequest({ id: 'unanswered', title: 'Help moving' }),
    ];

    render();

    expect(await screen.findByRole('link', { name: 'Borrow a ladder' })).toHaveAttribute(
      'href',
      routes.request('answered'),
    );
    expect(screen.getByText('2 members can help')).toBeInTheDocument();
    expect(screen.getByText('No answers yet')).toBeInTheDocument();

    const [url] = server.find('/api/requests');

    expect(url?.searchParams.get('requesterId')).toEqual('me');
    expect(url?.searchParams.get('status')).toEqual('pending');
  });

  it('shows three open requests at most', async () => {
    server.openRequests = Array.from({ length: 5 }, (_, index) =>
      createRequest({ title: `Request ${index}` }),
    );

    render();

    expect(await screen.findByRole('link', { name: 'See the 5 open requests' })).toHaveAttribute(
      'href',
      routes.requests({ mine: true }),
    );
    expect(screen.queryByRole('link', { name: 'Request 3' })).not.toBeInTheDocument();
  });
});

let nextId = 1;

const createRequest = createFactory<RequestListItem>(() => ({
  id: `r${nextId++}`,
  status: RequestStatus.pending,
  date: new Date().toISOString(),
  requester: me,
  title: '',
  message: { body: '', attachments: [] },
  positiveAnswersCount: 0,
}));

class Server extends FakeServer {
  openRequests: RequestListItem[] = [];

  init() {
    this.register('GET /api/requests', ({ url }) => {
      return this.json(this.paginate(this.openRequests, url.searchParams), {
        headers: { 'X-Pagination-Total': String(this.openRequests.length) },
      });
    });
  }
}
