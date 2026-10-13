import type { AddInterestMemberBody, Interest } from '@sel/shared';
import { createInterest } from '@sel/shared/factories';
import { assert, defined } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { claire, julien, me } from 'src/tests/fixtures';
import { renderTestPage } from 'src/tests/test-page';

import { InterestsPage } from './interests-page';

describe('interests', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('lists the interests', async () => {
    server.interests = [
      createInterest({
        id: 'i1',
        label: 'Gardening',
        description: 'Vegetable gardens, seeds and cuttings.',
        members: [claire, julien],
      }),
      createInterest({ id: 'i2', label: 'Music' }),
    ];

    renderPage();

    const gardening = await findCard('Gardening');

    expect(within(gardening).getByRole('link', { name: 'Gardening' })).toHaveAttribute(
      'href',
      routes.interest('i1'),
    );
    expect(gardening).toHaveTextContent('Vegetable gardens, seeds and cuttings.');
    expect(gardening).toHaveTextContent('2 members');

    expect(await findCard('Music')).toHaveTextContent('No members yet');
  });

  it('marks the interests the member is interested in', async () => {
    server.interests = [
      createInterest({ id: 'i1', label: 'Gardening', members: [me] }),
      createInterest({ id: 'i2', label: 'Music' }),
    ];

    renderPage();

    const gardening = await findCard('Gardening');

    expect(within(gardening).getByText('In your interests')).toBeInTheDocument();
    expect(within(gardening).queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    expect(within(await findCard('Music')).queryByText('In your interests')).not.toBeInTheDocument();
  });

  it("filters the member's interests", async () => {
    server.interests = [
      createInterest({ id: 'i1', label: 'Gardening', members: [me] }),
      createInterest({ id: 'i2', label: 'Music' }),
    ];

    renderPage();

    await user.click(await screen.findByRole('button', { name: 'My interests' }));

    expect(await findCard('Gardening')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Music' })).not.toBeInTheDocument();
  });

  it('tells when the member has not chosen any interest', async () => {
    server.interests = [createInterest({ id: 'i1', label: 'Gardening' })];

    renderPage(`${routes.interests()}?mine=true`);

    expect(await screen.findByText("You haven't chosen any interest yet")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'See all interests' }));

    expect(await findCard('Gardening')).toBeInTheDocument();
  });

  it('tells when there is no interest', async () => {
    renderPage();

    expect(await screen.findByText('No interests yet')).toBeInTheDocument();
  });

  describe('adding an interest', () => {
    it('adds an interest with a note', async () => {
      server.interests = [createInterest({ id: 'i1', label: 'Gardening' })];

      renderPage();

      await user.click(within(await findCard('Gardening')).getByRole('button', { name: 'Add' }));

      const dialog = await screen.findByRole('dialog', { name: 'Add “Gardening” to your interests' });

      await user.type(within(dialog).getByRole('textbox', { name: /^Note/ }), '  I can share seeds.  ');
      await user.click(within(dialog).getByRole('button', { name: 'Add' }));

      expect(await screen.findByText('“Gardening” added to your interests')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(within(await findCard('Gardening')).getByText('In your interests')).toBeInTheDocument();
      expect(server.joins).toEqual([{ description: 'I can share seeds.' }]);
    });

    it('adds an interest without a note', async () => {
      server.interests = [createInterest({ id: 'i1', label: 'Gardening' })];

      renderPage();

      await user.click(within(await findCard('Gardening')).getByRole('button', { name: 'Add' }));
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Add' }));

      expect(await screen.findByText('“Gardening” added to your interests')).toBeInTheDocument();
      expect(server.joins).toEqual([{}]);
    });
  });
});

function renderPage(path = routes.interests()) {
  return renderTestPage(path, [
    { path: routes.interests(), middleware: [requireSession], Component: InterestsPage },
  ]);
}

async function findCard(label: string) {
  const card = (await screen.findByRole('link', { name: label })).closest('li');

  assert(card !== null);

  return card;
}

class Server extends FakeServer {
  interests: Interest[] = [];
  joins: AddInterestMemberBody[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/interests', () => this.json(this.interests));

    this.register('PUT /api/interests/i1/join', ({ body }) => {
      const { description } = body as AddInterestMemberBody;

      this.joins.push(body as AddInterestMemberBody);
      defined(this.interests.find(({ id }) => id === 'i1')).members.push({ ...me, description });

      return this.noContent();
    });
  }
}
