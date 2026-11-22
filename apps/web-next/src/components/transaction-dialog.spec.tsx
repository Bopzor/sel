import { type CreateTransactionBody, type LightMember } from '@sel/shared';
import { createMember } from '@sel/shared/factories';
import { screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';
import { FakeServer } from 'src/tests/fake-server';
import { claire, julien, me } from 'src/tests/fixtures';
import { renderTest } from 'src/tests/test-page';

import { TransactionDialog, type TransactionDirection } from './transaction-dialog';

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
    await user.type(within(dialog).getByRole('textbox', { name: /^Subject/ }), reason);
  }

  async function next(dialog: HTMLElement) {
    await user.click(within(dialog).getByRole('button', { name: 'Next' }));
  }

  async function back(dialog: HTMLElement) {
    await user.click(within(dialog).getByRole('button', { name: 'Back' }));
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

    await user.click(within(dialog).getByRole('button', { name: 'Send units' }));

    const results = await within(dialog).findByRole('list', { name: 'Members' });

    expect(
      within(results)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Claire Dubois', 'Julien Petit']);

    await user.type(within(dialog).getByRole('searchbox', { name: 'Member' }), 'clai'); // cspell:disable-line
    await user.click(within(results).getByRole('button', { name: 'Claire Dubois' }));

    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveFocus();

    await fillDetails(dialog, { amount: '20', reason: 'Help with moving' });
    await user.type(within(dialog).getByRole('textbox', { name: 'Comment (optional)' }), 'Thanks!');
    await next(dialog);

    expect(recap(dialog)).toEqual([
      ['Exchange', 'Send units'],
      ['Member', 'Claire Dubois'],
      ['Amount', '20 units'],
      ['Subject', 'Help with moving'],
      ['Comment', 'Thanks!'],
    ]);

    await user.click(within(dialog).getByRole('button', { name: 'Send 20 units' }));

    expect(await screen.findByText('Exchange recorded')).toBeInTheDocument();
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

  it('requests units from a given member, without the direction and member steps', async () => {
    const dialog = await open({ direction: 'request', counterpart: julien });

    await fillDetails(dialog, { amount: '1', reason: 'Gardening' });
    await next(dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Request 1 unit' }));

    expect(await screen.findByText('Request sent to Julien Petit')).toBeInTheDocument();
    expect(server.find('/api/members')).toHaveLength(0);

    expect(server.transactions).toEqual<CreateTransactionBody[]>([
      { payerId: 'julien', recipientId: 'me', amount: 1, description: 'Gardening' },
    ]);
  });

  it('chooses the direction with a given member, without the member step', async () => {
    const dialog = await open({ counterpart: julien });

    await user.click(within(dialog).getByRole('button', { name: 'Request units' }));
    await fillDetails(dialog, { amount: '1', reason: 'Gardening' });
    await next(dialog);

    expect(recap(dialog)).toEqual([
      ['Exchange', 'Request units'],
      ['Member', 'Julien Petit'],
      ['Amount', '1 unit'],
      ['Subject', 'Gardening'],
    ]);
    expect(server.find('/api/members')).toHaveLength(0);
  });

  it('keeps the values when going back', async () => {
    const dialog = await open();

    await user.click(within(dialog).getByRole('button', { name: 'Send units' }));
    await selectMember(dialog, 'Claire Dubois');
    await fillDetails(dialog, { amount: '20', reason: 'Help with moving' });
    await next(dialog);
    await back(dialog);

    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveValue('20');

    await back(dialog);
    await back(dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Request units' }));
    await selectMember(dialog, 'Julien Petit');

    expect(within(dialog).getByRole('textbox', { name: /^Subject/ })).toHaveValue('Help with moving');

    await next(dialog);

    expect(recap(dialog)).toEqual([
      ['Exchange', 'Request units'],
      ['Member', 'Julien Petit'],
      ['Amount', '20 units'],
      ['Subject', 'Help with moving'],
    ]);
  });

  it('shows the errors of the details step', async () => {
    const dialog = await open({ direction: 'send', counterpart: claire });

    await fillDetails(dialog, { amount: '1.5', reason: 'Gardening' });
    await next(dialog);

    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveAccessibleErrorMessage(
      'This field should be a whole number',
    );
  });

  it('shows an error when the exchange cannot be created', async () => {
    server.failTransaction = true;

    const dialog = await open({ direction: 'send', counterpart: claire });

    await fillDetails(dialog, { amount: '1', reason: 'Gardening' });
    await next(dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Send 1 unit' }));

    expect(await within(dialog).findByText("The exchange couldn't be created")).toBeInTheDocument();
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
