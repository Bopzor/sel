import {
  createAuthenticatedMember,
  createMember,
  createMemberActivityItem,
  type Member,
  type MemberActivityCounts,
  type MemberActivityItem,
} from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { renderTestPage } from 'src/tests/test-page';

import { MemberPage } from './member-page';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire = createMember({ id: 'claire', firstName: 'Claire', lastName: 'Dubois' });

const past = new Date(2020, 0, 1).toISOString();
const future = new Date(2100, 0, 1).toISOString();

describe('member activity', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it("shows the member's activity counts", async () => {
    server.counts = {
      requests: 4,
      requestAnswers: 7,
      events: 1,
      eventParticipations: 3,
      information: 2,
      comments: 12,
    };

    renderPage(routes.member('claire', 'activity'));

    expect(await screen.findByText('Offers to help', { selector: 'dt' })).toBeInTheDocument();
    expect(getDefinition('Requests')).toHaveTextContent('4');
    expect(getDefinition('Offers to help')).toHaveTextContent('7');
    expect(getDefinition('Events organized')).toHaveTextContent('1');
    expect(getDefinition('Events attended')).toHaveTextContent('3');
    expect(getDefinition('Information')).toHaveTextContent('2');
  });

  it("lists the member's activity", async () => {
    server.items = [
      createMemberActivityItem({
        type: 'request',
        entity: { type: 'request', id: 'requestId', title: 'Bread' },
      }),
      createMemberActivityItem({
        type: 'request-answer',
        entity: { type: 'request', id: 'answeredId', title: 'Gardening' },
      }),
      createMemberActivityItem({
        type: 'event',
        entity: { type: 'event', id: 'eventId', title: 'Picnic', date: future },
      }),
      createMemberActivityItem({
        type: 'event-participation',
        entity: { type: 'event', id: 'attendedId', title: 'Concert', date: past },
      }),
      createMemberActivityItem({
        type: 'information',
        entity: { type: 'information', id: 'informationId', title: 'New members' },
      }),
    ];

    renderPage(routes.member('claire', 'activity'));

    await screen.findByText('Bread');
    const items = screen.getAllByRole('listitem').map((item) => item.textContent);

    expect(items[0]).toContain('Posted the request Bread');
    expect(items[1]).toContain('Offered to help on Gardening');
    expect(items[2]).toContain('Organizes Picnic');
    expect(items[3]).toContain('Attended Concert');
    expect(items[4]).toContain('Posted the information New members');

    expect(screen.getByRole('link', { name: 'Bread' })).toHaveAttribute('href', '/requests/requestId');
    expect(screen.getByRole('link', { name: 'Picnic' })).toHaveAttribute('href', '/events/eventId');
    expect(screen.getByRole('link', { name: 'New members' })).toHaveAttribute(
      'href',
      '/information/informationId',
    );
  });

  it("lists the member's exchanges", async () => {
    const julien = createMember({ id: 'julien', firstName: 'Julien', lastName: 'Petit' });

    server.items = [
      createMemberActivityItem({
        type: 'transaction',
        amount: 3,
        description: 'Bread',
        payer: claire,
        recipient: julien,
      }),
      createMemberActivityItem({
        type: 'transaction',
        amount: 1,
        description: 'Gardening',
        payer: julien,
        recipient: claire,
      }),
    ];

    renderPage(routes.member('claire', 'activity'));

    await screen.findByText('Bread');
    const [sent, received] = screen.getAllByRole('listitem');

    expect(sent).toHaveTextContent('Sent 3 units to Julien Petit');
    expect(sent).toHaveTextContent('Bread');
    expect(within(sent!).getByRole('link', { name: 'Julien Petit' })).toHaveAttribute(
      'href',
      '/members/julien',
    );
    expect(received).toHaveTextContent('Received 1 unit from Julien Petit');
  });

  it('shows the comments once asked', async () => {
    server.items = [
      createMemberActivityItem({ entity: { type: 'request', id: 'requestId', title: 'Bread' } }),
    ];
    server.comments = [
      createMemberActivityItem({
        type: 'comment',
        entity: { type: 'request', id: 'requestId', title: 'Bread' },
        body: '<p>Count me in</p>',
      }),
    ];

    renderPage(routes.member('claire', 'activity'));

    await screen.findByText('Bread');

    expect(screen.queryByText('Count me in')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show comments' }));

    const comment = (await screen.findByText('Count me in')).closest('li');

    expect(comment).toHaveTextContent('Commented on Bread');
    expect(server.find('/api/members/claire/activity').at(-1)?.searchParams.get('includeComments')).toEqual(
      'true',
    );
  });

  it('loads more activity', async () => {
    server.items = Array.from({ length: 12 }, (_, index) =>
      createMemberActivityItem({
        entity: { type: 'request', id: `request${index}`, title: `Request ${index}` },
      }),
    );

    renderPage(routes.member('claire', 'activity'));

    expect(await screen.findByText('Showing 10 of 12 activities')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show more' }));

    expect(await screen.findByText('Request 11')).toBeInTheDocument();
  });

  it('tells when the member has no activity yet', async () => {
    renderPage(routes.member('claire', 'activity'));

    expect(await screen.findByRole('heading', { name: 'No activity yet' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Post a request' })).not.toBeInTheDocument();
  });

  it('invites me to post a request when I have no activity yet', async () => {
    renderPage(routes.member('me', 'activity'));

    const emptyState = (await screen.findByRole('heading', { name: 'No activity yet' })).parentElement!;

    expect(within(emptyState).getByRole('link', { name: 'Post a request' })).toHaveAttribute(
      'href',
      routes.createRequest(),
    );
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
  counts: MemberActivityCounts = {
    requests: 0,
    requestAnswers: 0,
    events: 0,
    eventParticipations: 0,
    information: 0,
    comments: 0,
  };

  items: MemberActivityItem[] = [];
  comments: MemberActivityItem[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    for (const member of [claire, me] as Member[]) {
      this.register(`GET /api/members/${member.id}`, () => this.json(member));
      this.register(`GET /api/members/${member.id}/activity/counts`, () => this.json(this.counts));

      this.register(`GET /api/members/${member.id}/activity`, ({ url }) => {
        const params = url.searchParams;
        const items =
          params.get('includeComments') === 'true' ? [...this.items, ...this.comments] : this.items;

        return this.json(this.paginate(items, params), {
          headers: { 'X-Pagination-Total': String(items.length) },
        });
      });
    }
  }
}
