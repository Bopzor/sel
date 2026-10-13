import type { AddInterestMemberBody, EditInterestMemberBody, Interest } from '@sel/shared';
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

import { InterestPage } from './interest-page';

describe('interest', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows the interest and its members', async () => {
    server.interest = createInterest({
      id: 'i1',
      label: 'Gardening',
      description: 'Vegetable gardens, seeds and cuttings.',
      members: [{ ...claire, description: 'I can share seeds.' }, julien],
    });

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Gardening' })).toBeInTheDocument();
    expect(screen.getByText('Vegetable gardens, seeds and cuttings.')).toBeInTheDocument();

    const members = await findSection('2 members');
    const [first, second] = within(members).getAllByRole('listitem');

    assert(first !== undefined && second !== undefined);
    expect(within(first).getByRole('link', { name: 'Claire Dubois' })).toHaveAttribute(
      'href',
      routes.member('claire'),
    );
    expect(first).toHaveTextContent('I can share seeds.');
    expect(within(second).getByRole('link', { name: 'Julien Petit' })).toBeInTheDocument();
  });

  it('tells when no one has chosen the interest', async () => {
    server.interest = createInterest({ id: 'i1' });

    renderPage();

    expect(await screen.findByText('No one has chosen this interest yet.')).toBeInTheDocument();
  });

  it('shows the page not found when the interest does not exist', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Interest not found' })).toBeInTheDocument();
  });

  describe('participation', () => {
    it('adds the interest', async () => {
      server.interest = createInterest({ id: 'i1', label: 'Gardening' });

      renderPage();

      await user.type(await screen.findByRole('textbox', { name: /^Note/ }), 'I have a balcony.');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(await screen.findByRole('heading', { name: 'In your interests' })).toBeInTheDocument();
      expect(server.joins).toEqual([{ description: 'I have a balcony.' }]);

      const members = await findSection('1 member');

      expect(within(members).getByRole('link', { name: 'Jason Talon' })).toBeInTheDocument();
      expect(members).toHaveTextContent('I have a balcony.');
    });

    it("edits the member's note", async () => {
      server.interest = createInterest({ id: 'i1', members: [{ ...me, description: 'Old note' }] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Edit my note' }));

      const note = screen.getByRole('textbox', { name: /^Note/ });

      expect(note).toHaveValue('Old note');

      await user.clear(note);
      await user.type(note, 'New note');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Your note was saved')).toBeInTheDocument();
      expect(await screen.findByRole('heading', { name: 'In your interests' })).toBeInTheDocument();
      expect(server.edits).toEqual([{ description: 'New note' }]);
    });

    it("removes the member's note", async () => {
      server.interest = createInterest({ id: 'i1', members: [{ ...me, description: 'Old note' }] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Edit my note' }));
      await user.clear(screen.getByRole('textbox', { name: /^Note/ }));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText("You haven't written a note.")).toBeInTheDocument();
      expect(server.edits).toEqual([{}]);
    });

    it('cancels the edition of the note', async () => {
      server.interest = createInterest({ id: 'i1', members: [{ ...me, description: 'Old note' }] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Edit my note' }));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(await screen.findByRole('heading', { name: 'In your interests' })).toBeInTheDocument();
      expect(server.edits).toEqual([]);
    });

    it('removes the interest', async () => {
      server.interest = createInterest({ id: 'i1', members: [me, claire] });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'No longer interested' }));

      expect(
        await screen.findByRole('heading', { name: 'Add to my interests', level: 2 }),
      ).toBeInTheDocument();
      expect(await findSection('1 member')).not.toHaveTextContent('Jason Talon');
    });
  });
});

function renderPage() {
  return renderTestPage(routes.interest('i1'), [
    { path: routes.interest(':interestId'), middleware: [requireSession], Component: InterestPage },
  ]);
}

async function findSection(heading: string) {
  const title = await screen.findByRole('heading', { name: heading });
  const section = title.closest('section');

  assert(section !== null);

  return section;
}

class Server extends FakeServer {
  interest: Interest | undefined;
  joins: AddInterestMemberBody[] = [];
  edits: EditInterestMemberBody[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/interests', () => this.json(this.interest ? [this.interest] : []));

    this.register('PUT /api/interests/i1/join', ({ body }) => {
      const { description } = body as AddInterestMemberBody;

      this.joins.push(body as AddInterestMemberBody);
      defined(this.interest).members.push({ ...me, description });

      return this.noContent();
    });

    this.register('PUT /api/interests/i1/edit', ({ body }) => {
      const { description } = body as EditInterestMemberBody;
      const member = defined(defined(this.interest).members.find(({ id }) => id === me.id));

      this.edits.push(body as EditInterestMemberBody);
      member.description = description;

      return this.noContent();
    });

    this.register('PUT /api/interests/i1/leave', () => {
      const interest = defined(this.interest);

      interest.members = interest.members.filter(({ id }) => id !== me.id);

      return this.noContent();
    });
  }
}
