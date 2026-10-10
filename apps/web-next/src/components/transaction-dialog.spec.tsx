import {
  createAuthenticatedMember,
  createMember,
  type CreateTransactionBody,
  type LightMember,
} from '@sel/shared';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { FakeServer } from 'src/tests/fake-server';
import { renderTest } from 'src/tests/test-page';

import { TransactionDialog, type TransactionDirection } from './transaction-dialog';

const me = createAuthenticatedMember({ id: 'me', firstName: 'Jason', lastName: 'Talon' });
const claire = createMember({ id: 'claire', firstName: 'Claire', lastName: 'Dubois' });
const julien = createMember({ id: 'julien', firstName: 'Julien', lastName: 'Petit' });

describe('TransactionDialog', () => {
  let user: UserEvent;
  let server: Server;

  beforeEach(() => {
    user = userEvent.setup();
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  function Test(props: { direction?: TransactionDirection; counterpart?: LightMember }) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>

        <TransactionDialog open={open} onClose={() => setOpen(false)} {...props} />
      </>
    );
  }

  async function open(props: React.ComponentProps<typeof Test> = {}) {
    queryClient.setQueryData(queries.session().queryKey, me);
    renderTest(<Test {...props} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));

    return screen.findByRole('dialog');
  }

  async function selectMember(dialog: HTMLElement, name: string) {
    const results = await within(dialog).findByRole('list', { name: 'Members' });

    await user.click(within(results).getByRole('button', { name }));
  }

  async function fillDetails(dialog: HTMLElement, { amount, reason }: { amount: string; reason: string }) {
    await user.type(within(dialog).getByRole('textbox', { name: 'Amount' }), amount);
    await user.type(within(dialog).getByRole('textbox', { name: /^Reason/ }), reason);
  }

  async function next(dialog: HTMLElement) {
    await user.click(within(dialog).getByRole('button', { name: 'Next' }));
  }

  // The text read by a screen reader: without the initials of the decorative avatars.
  function recap(dialog: HTMLElement) {
    const spokenText = (element: Element | null) => {
      const clone = element?.cloneNode(true) as Element | undefined;

      clone?.querySelectorAll('[aria-hidden]').forEach((hidden) => hidden.remove());

      return clone?.textContent;
    };

    return Array.from(dialog.querySelectorAll('dt')).map((term) => [
      term.textContent,
      spokenText(term.nextElementSibling),
    ]);
  }

  it('sends units to a member found by the search', async () => {
    const dialog = await open();

    expect(dialog).toHaveAccessibleName('New exchange');
    expect(dialog).toHaveTextContent('Step 1 of 3');

    await user.click(within(dialog).getByRole('radio', { name: /^Send units/ }));
    await user.type(within(dialog).getByRole('searchbox', { name: 'Member' }), 'clai'); // cspell:disable-line

    const results = within(dialog).getByRole('list', { name: 'Members' });

    expect(
      within(results)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Claire Dubois']);

    await user.click(within(results).getByRole('button', { name: 'Claire Dubois' }));
    await next(dialog);

    expect(dialog).toHaveTextContent('Step 2 of 3');
    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveFocus();

    await fillDetails(dialog, { amount: '20', reason: 'Help with moving' });
    await user.type(within(dialog).getByRole('textbox', { name: 'Comment (optional)' }), 'Thanks!');
    await next(dialog);

    expect(dialog).toHaveTextContent('Step 3 of 3');
    expect(dialog.querySelector('dl')).toHaveFocus();
    expect(recap(dialog)).toEqual([
      ['Exchange', 'Send units'],
      ['Member', 'Claire Dubois'],
      ['Amount', '20 units'],
      ['Reason', 'Help with moving'],
      ['Comment', 'Thanks!'],
    ]);

    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Claire Dubois does not need to confirm: the exchange is completed right away.',
    );

    await user.click(within(dialog).getByRole('button', { name: 'Send 20 units' }));

    expect(await screen.findByText('The exchange is recorded')).toBeInTheDocument();
    expect(dialog).not.toBeInTheDocument();

    expect(server.transactions).toEqual<CreateTransactionBody[]>([
      {
        payerId: 'me',
        recipientId: 'claire',
        amount: 20,
        description: 'Help with moving',
        comment: 'Thanks!',
      },
    ]);
  });

  it('requests units from a given member, without the exchange step', async () => {
    const dialog = await open({ direction: 'request', counterpart: julien });

    expect(dialog).toHaveAccessibleName('Request units from Julien Petit');
    expect(dialog).toHaveTextContent('Step 1 of 2');
    expect(server.find('/api/members')).toHaveLength(0);

    await fillDetails(dialog, { amount: '1', reason: 'Gardening' });
    await next(dialog);

    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Julien Petit needs to confirm to complete the exchange.',
    );

    await user.click(within(dialog).getByRole('button', { name: 'Request 1 unit' }));

    expect(await screen.findByText('The request is sent to Julien Petit')).toBeInTheDocument();

    expect(server.transactions).toEqual<CreateTransactionBody[]>([
      { payerId: 'julien', recipientId: 'me', amount: 1, description: 'Gardening' },
    ]);
  });

  it('shows the given member without the search', async () => {
    const dialog = await open({ counterpart: julien });

    expect(within(dialog).getByRole('radio', { name: /^Send units/ })).toBeInTheDocument();
    expect(within(dialog).getByText('Julien Petit')).toBeInTheDocument();
    expect(within(dialog).queryByRole('searchbox')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /^Change/ })).not.toBeInTheDocument();
  });

  it('does not list the current member', async () => {
    const dialog = await open();

    const results = await within(dialog).findByRole('list', { name: 'Members' });

    expect(
      within(results)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Claire Dubois', 'Julien Petit']);
  });

  it('brings the search back to change the member', async () => {
    const dialog = await open({ direction: 'send' });

    await selectMember(dialog, 'Claire Dubois');

    expect(within(dialog).queryByRole('searchbox')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Change the member' })).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Change the member' }));

    expect(within(dialog).getByRole('searchbox', { name: 'Member' })).toHaveFocus();
    expect(within(dialog).getByRole('button', { name: 'Julien Petit' })).toBeInTheDocument();
  });

  it('selects the first member on enter, without going to the next step', async () => {
    const dialog = await open({ direction: 'send' });

    await within(dialog).findByRole('list', { name: 'Members' });
    await user.type(within(dialog).getByRole('searchbox', { name: 'Member' }), 'p{Enter}');

    expect(within(dialog).getByText('Julien Petit')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Change the member' })).toHaveFocus();
    expect(dialog).toHaveTextContent('Step 1 of 3');
  });

  it('tells when no member matches the search', async () => {
    const dialog = await open();

    await within(dialog).findByRole('list', { name: 'Members' });
    await user.type(within(dialog).getByRole('searchbox', { name: 'Member' }), 'nobody');

    expect(within(dialog).getByText('No member matches this search')).toBeInTheDocument();
  });

  it('keeps the values when going back', async () => {
    const dialog = await open({ direction: 'send' });

    await selectMember(dialog, 'Claire Dubois');
    await next(dialog);
    await fillDetails(dialog, { amount: '20', reason: 'Help with moving' });
    await next(dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Back' }));

    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveValue('20');

    await user.click(within(dialog).getByRole('button', { name: 'Back' }));

    expect(within(dialog).getByText('Claire Dubois')).toBeInTheDocument();

    await next(dialog);

    expect(within(dialog).getByRole('textbox', { name: /^Reason/ })).toHaveValue('Help with moving');
  });

  it('shows the errors of the exchange step', async () => {
    const dialog = await open();

    await next(dialog);

    expect(within(dialog).getByRole('group', { name: 'What do you want to do?' })).toHaveTextContent(
      'Select an option',
    );
    expect(within(dialog).getByRole('searchbox', { name: 'Member' })).toHaveAccessibleErrorMessage(
      'This field is required',
    );
    expect(dialog).toHaveTextContent('Step 1 of 3');
  });

  it('shows the errors of the details step', async () => {
    const dialog = await open({ direction: 'send', counterpart: claire });

    await fillDetails(dialog, { amount: '1.5', reason: 'Gardening' });
    await next(dialog);

    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveAccessibleErrorMessage(
      'This field should be a whole number',
    );
    expect(dialog).toHaveTextContent('Step 1 of 2');
  });

  it('shows an error when the exchange cannot be created', async () => {
    server.failTransaction = true;

    const dialog = await open({ direction: 'send', counterpart: claire });

    await fillDetails(dialog, { amount: '1', reason: 'Gardening' });
    await next(dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Send 1 unit' }));

    expect(await within(dialog).findByText('The exchange could not be created')).toBeInTheDocument();
  });
});

class Server extends FakeServer {
  transactions: CreateTransactionBody[] = [];
  failTransaction = false;

  init() {
    this.register('GET /api/members', () => this.json([claire, julien, createMember({ ...me })]));

    this.register('POST /api/transactions', ({ body }) => {
      if (this.failTransaction) {
        return this.json({ error: 'Server error' }, { status: 500 });
      }

      this.transactions.push(body as CreateTransactionBody);

      return this.json('transactionId', { status: 201 });
    });

    this.register('GET /api/session/member', () => this.json(me));
  }
}
