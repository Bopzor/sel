import {
  RequestStatus,
  type Comment,
  type CreateTransactionBody,
  type Request,
  type SetRequestAnswerBody,
} from '@sel/shared';
import { createComment, createMessage, createRequest } from '@sel/shared/factories';
import { assert, defined } from '@sel/utils';
import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from 'src/app/routes';
import { requireSession } from 'src/app/session';
import { FakeServer } from 'src/tests/fake-server';
import { claire, julien, me } from 'src/tests/fixtures';
import { renderTestPage } from 'src/tests/test-page';

import { RequestPage } from './request-page';

describe('request', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    vi.stubGlobal('fetch', server.fetch);
  });

  it('shows the request', async () => {
    server.request = createRequest({
      id: 'r1',
      title: 'Cat sitting',
      message: {
        body: '<p>I am away for a week.</p>',
        attachments: [
          { fileId: 'f1', name: 'cat.jpg', originalName: 'Whiskers.jpg', mimetype: 'image/jpeg' },
          { fileId: 'f2', name: 'notes.pdf', originalName: 'Instructions.pdf', mimetype: 'application/pdf' },
        ],
      },
    });

    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Cat sitting' })).toBeInTheDocument();
    expect(screen.getByText('I am away for a week.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Whiskers.jpg' })).toHaveAttribute('src', '/api/files/cat.jpg');
    expect(screen.getByRole('link', { name: 'Instructions.pdf' })).toHaveAttribute(
      'href',
      '/api/files/notes.pdf',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it("shows the requester's contact details", async () => {
    server.request = createRequest({
      id: 'r1',
      requester: { ...claire, email: 'claire@example.com', phoneNumber: '0612345678' },
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Claire Dubois' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '06 12 34 56 78' })).toHaveAttribute('href', 'tel:0612345678');
    expect(screen.getByRole('link', { name: 'claire@example.com' })).toHaveAttribute(
      'href',
      'mailto:claire@example.com',
    );
  });

  it('lists the answers, positive first', async () => {
    server.request = createRequest({
      id: 'r1',
      answers: [
        { id: 'a1', member: claire, answer: 'negative' },
        { id: 'a2', member: julien, answer: 'positive' },
      ],
    });

    renderPage();

    const answers = within(await findSection('Answers')).getAllByRole('listitem');

    expect(answers[0]).toHaveTextContent('Julien PetitCan help');
    expect(answers[1]).toHaveTextContent("Claire DuboisCan't help");
  });

  it('shows that no one has answered', async () => {
    server.request = createRequest({ id: 'r1', answers: [] });

    renderPage();

    expect(await screen.findByText('No one has answered yet.')).toBeInTheDocument();
  });

  it('lists the comments', async () => {
    server.request = createRequest({ id: 'r1' });
    server.comments = [
      createComment({ author: julien, message: createMessage({ body: '<p>I can help.</p>' }) }),
    ];

    renderPage();

    const comments = await findSection('1 comment');

    expect(comments).toContainOneByText('Julien Petit');
    expect(comments).toContainOneByText('I can help.');

    const [url] = server.find('/api/comment');
    expect(url?.searchParams.get('entityType')).toBe('request');
    expect(url?.searchParams.get('entityId')).toBe('r1');
  });

  it.each([
    [RequestStatus.fulfilled, 'This request is fulfilled'],
    [RequestStatus.canceled, 'This request was canceled'],
  ])('shows that the request is %s', async (status, message) => {
    server.request = createRequest({ id: 'r1', status });

    renderPage();

    expect(await screen.findByRole('status')).toHaveTextContent(message);
  });

  it('shows that the request does not exist', async () => {
    server.request = undefined;

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Request not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all requests' })).toHaveAttribute('href', '/requests');
  });

  it('retries loading the request after a failure', async () => {
    const user = userEvent.setup();

    server.request = createRequest({ id: 'r1', title: 'Cat sitting' });
    server.failing = true;

    renderPage();

    await screen.findByText('Unable to load the request');

    server.failing = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Cat sitting' })).toBeInTheDocument();
  });

  describe('answer', () => {
    it('answers that the member can help', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: claire });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'I can help' }));

      expect(await screen.findByRole('heading', { name: 'You can help' })).toBeInTheDocument();
      expect(screen.getByText('Contact Claire to arrange the details.')).toBeInTheDocument();
      expect(server.answers).toEqual(['positive']);

      const answers = within(await findSection('Answers')).getAllByRole('listitem');
      expect(answers[0]).toHaveTextContent('Jason TalonCan help');
    });

    it('answers that the member cannot help', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: claire });

      renderPage();

      await user.click(await screen.findByRole('button', { name: "I can't" }));

      expect(await screen.findByRole('heading', { name: "You can't help" })).toBeInTheDocument();
      expect(server.answers).toEqual(['negative']);
    });

    it('withdraws the answer', async () => {
      const user = userEvent.setup();

      server.request = createRequest({
        id: 'r1',
        requester: claire,
        answers: [{ id: 'a1', member: me, answer: 'positive' }],
      });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Withdraw my answer' }));

      expect(await screen.findByRole('heading', { name: 'Can you help?' })).toBeInTheDocument();
      expect(screen.getByText('No one has answered yet.')).toBeInTheDocument();
      expect(server.answers).toEqual([null]);
    });

    it('shows that the answer could not be saved', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: claire });
      server.answerFailing = true;

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'I can help' }));

      expect(await screen.findByText("Your answer couldn't be saved")).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Can you help?' })).toBeInTheDocument();
    });

    it("does not offer to answer the member's own request", async () => {
      server.request = createRequest({ id: 'r1', requester: me });

      renderPage();

      await screen.findByRole('heading', { level: 1 });

      expect(screen.queryByRole('heading', { name: 'Can you help?' })).not.toBeInTheDocument();
    });

    it('does not offer to answer a closed request', async () => {
      server.request = createRequest({ id: 'r1', requester: claire, status: RequestStatus.fulfilled });

      renderPage();

      await screen.findByRole('heading', { level: 1 });

      expect(screen.queryByRole('heading', { name: 'Can you help?' })).not.toBeInTheDocument();
    });
  });

  describe('requester actions', () => {
    it('offers the requester to edit the request', async () => {
      server.request = createRequest({ id: 'r1', requester: me });

      renderPage();

      expect(await screen.findByRole('heading', { name: 'Your request' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/requests/r1/edit');
    });

    it('closes the request', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: me, title: 'Cat sitting' });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Close the request' }));

      const dialog = await screen.findByRole('alertdialog', { name: 'Close the request “Cat sitting”?' });
      expect(dialog).toContainOneByText("You haven't sent any units for this request");

      await user.click(within(dialog).getByRole('button', { name: 'Close the request' }));

      expect(await screen.findByText('Request closed')).toBeInTheDocument();
      expect(screen.getByText('This request is fulfilled')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Your request' })).not.toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('does not mention the units when some were sent', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: me, hasTransactions: true });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Close the request' }));

      await screen.findByRole('alertdialog');
      expect(screen.queryByText("You haven't sent any units for this request")).not.toBeInTheDocument();
    });

    it('cancels the request', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: me, title: 'Cat sitting' });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Cancel the request' }));

      const dialog = await screen.findByRole('alertdialog', { name: 'Cancel the request “Cat sitting”?' });
      await user.click(within(dialog).getByRole('button', { name: 'Cancel the request' }));

      expect(await screen.findByText('Request canceled')).toBeInTheDocument();
      expect(screen.getByText('This request was canceled')).toBeInTheDocument();
    });

    it('keeps the request open when going back', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: me });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Cancel the request' }));
      await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Back' }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(server.find('/api/requests/r1/cancel')).toEqual([]);
    });

    it('shows that the request could not be closed', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: me });
      server.statusFailing = true;

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Close the request' }));

      const dialog = await screen.findByRole('alertdialog');
      await user.click(within(dialog).getByRole('button', { name: 'Close the request' }));

      expect(await screen.findByText("The request couldn't be closed")).toBeInTheDocument();
      expect(screen.getByRole('alertdialog')).toBe(dialog);
      expect(screen.queryByText('This request is fulfilled')).not.toBeInTheDocument();
    });

    it('does not offer the actions to another member', async () => {
      server.request = createRequest({ id: 'r1', requester: claire });

      renderPage();

      await screen.findByRole('heading', { level: 1 });

      expect(screen.queryByRole('heading', { name: 'Your request' })).not.toBeInTheDocument();
    });

    it('does not offer the actions on a closed request', async () => {
      server.request = createRequest({ id: 'r1', requester: me, status: RequestStatus.canceled });

      renderPage();

      await screen.findByRole('heading', { level: 1 });

      expect(screen.queryByRole('heading', { name: 'Your request' })).not.toBeInTheDocument();
    });
  });

  describe('exchange', () => {
    async function fillAmount(dialog: HTMLElement) {
      const user = userEvent.setup();

      await user.type(within(dialog).getByRole('textbox', { name: 'Amount' }), '20');
      await user.click(within(dialog).getByRole('button', { name: 'Next' }));
    }

    it('sends units from the requester to a member, linked to the request', async () => {
      const user = userEvent.setup();

      server.request = createRequest({ id: 'r1', requester: me, title: 'Cat sitting' });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Exchange units' }));

      const dialog = await screen.findByRole('dialog', { name: 'Send units' });
      expect(within(dialog).queryByRole('radiogroup')).not.toBeInTheDocument();

      const members = await within(dialog).findByRole('list', { name: 'Members' });
      await user.click(within(members).getByRole('button', { name: 'Claire Dubois' }));
      await user.click(within(dialog).getByRole('button', { name: 'Next' }));
      await fillAmount(dialog);
      await user.click(within(dialog).getByRole('button', { name: 'Send 20 units' }));

      expect(await screen.findByText('Exchange recorded')).toBeInTheDocument();
      expect(server.transactions).toEqual<CreateTransactionBody[]>([
        { payerId: 'me', recipientId: 'claire', amount: 20, description: 'Cat sitting', requestId: 'r1' },
      ]);
    });

    it('offers the requester to send units on a closed request', async () => {
      server.request = createRequest({ id: 'r1', requester: me, status: RequestStatus.fulfilled });

      renderPage();

      expect(await screen.findByRole('button', { name: 'Exchange units' })).toBeInTheDocument();
    });

    it('requests units from the requester to a member who can help', async () => {
      const user = userEvent.setup();

      server.request = createRequest({
        id: 'r1',
        requester: claire,
        title: 'Cat sitting',
        answers: [{ id: 'a1', member: me, answer: 'positive' }],
      });

      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Exchange units' }));

      const dialog = await screen.findByRole('dialog', { name: 'Request units from Claire Dubois' });
      expect(dialog).toHaveTextContent('Step 1 of 2');
      expect(within(dialog).getByRole('textbox', { name: /^Subject/ })).toHaveValue('Cat sitting');

      await fillAmount(dialog);
      await user.click(within(dialog).getByRole('button', { name: 'Request 20 units' }));

      expect(await screen.findByText('Request sent to Claire Dubois')).toBeInTheDocument();
      expect(server.transactions).toEqual<CreateTransactionBody[]>([
        { payerId: 'claire', recipientId: 'me', amount: 20, description: 'Cat sitting', requestId: 'r1' },
      ]);
    });

    it.each([
      ['has not answered', []],
      ["can't help", [{ id: 'a1', member: me, answer: 'negative' as const }]],
    ])('does not offer an exchange to a member who %s', async (_, answers) => {
      server.request = createRequest({ id: 'r1', requester: claire, answers });

      renderPage();

      await screen.findByRole('heading', { level: 1 });

      expect(screen.queryByRole('button', { name: 'Exchange units' })).not.toBeInTheDocument();
    });
  });
});

function renderPage() {
  return renderTestPage(routes.request('r1'), [
    { path: routes.request(':requestId'), middleware: [requireSession], Component: RequestPage },
  ]);
}

async function findSection(heading: string) {
  const title = await screen.findByRole('heading', { name: heading });
  const section = title.closest('section');

  assert(section !== null);

  return section;
}

class Server extends FakeServer {
  request: Request | undefined;
  comments: Comment[] = [];
  answers: unknown[] = [];
  failing = false;
  answerFailing = false;
  statusFailing = false;
  transactions: CreateTransactionBody[] = [];

  init() {
    this.register('GET /api/session/member', () => this.json(me));

    this.register('GET /api/requests/r1', () => {
      if (this.failing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      if (!this.request) {
        return this.json({ error: 'Request not found' }, { status: 404 });
      }

      return this.json(this.request);
    });

    this.register('GET /api/comment', () => this.json(this.comments));
    this.register('GET /api/members', () => this.json([claire, julien]));

    this.register('POST /api/transactions', ({ body }) => {
      this.transactions.push(body as CreateTransactionBody);

      return this.json('transactionId', { status: 201 });
    });

    this.register('POST /api/requests/r1/answer', ({ body }) => {
      if (this.answerFailing) {
        return this.json({ error: 'Internal server error' }, { status: 500 });
      }

      const request = defined(this.request);
      const { answer } = body as SetRequestAnswerBody;

      this.answers.push(answer);

      request.answers = request.answers.filter((answer) => answer.member.id !== me.id);

      if (answer !== null) {
        request.answers.push({ id: 'my-answer', member: me, answer });
      }

      return this.noContent();
    });

    this.register('PUT /api/requests/r1/fulfil', () => this.changeStatus(RequestStatus.fulfilled));
    this.register('PUT /api/requests/r1/cancel', () => this.changeStatus(RequestStatus.canceled));
  }

  private changeStatus(status: RequestStatus) {
    if (this.statusFailing) {
      return this.json({ error: 'Internal server error' }, { status: 500 });
    }

    defined(this.request).status = status;

    return this.noContent();
  }
}
