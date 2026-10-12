import { createTransactionBodySchema, TransactionStatus } from '@sel/shared';
import { createId } from '@sel/utils';

import { demo } from '../demo';

export const demoTransactionRoutes = [
  demo.route('POST', '/transactions', ({ state, body, member }) => {
    const { payerId, recipientId, amount, description, comment, requestId } =
      createTransactionBodySchema.parse(body);
    const creatorId = member().id;

    demo.findMember(state, payerId);
    demo.findMember(state, recipientId);

    if (payerId === recipientId) {
      throw new demo.Error(400, 'The payer and the recipient cannot be equal');
    }

    if (creatorId !== payerId && creatorId !== recipientId) {
      throw new demo.Error(400, 'The creator must be either the payer or the recipient');
    }

    if (requestId !== undefined) {
      const request = state.requests.find(({ id }) => id === requestId) ?? demo.notFound('Request');

      if (request.requesterId !== payerId) {
        throw new demo.Error(400, 'The payer of a transaction linked to a request must be the requester');
      }
    }

    const transaction: demo.Transaction = {
      id: createId(),
      status: TransactionStatus.pending,
      amount,
      description,
      payerId,
      recipientId,
      payerComment: creatorId === payerId ? comment : undefined,
      recipientComment: creatorId === recipientId ? comment : undefined,
      requestId,
      createdAt: new Date().toISOString(),
    };

    state.transactions.push(transaction);

    if (creatorId === payerId) {
      complete(state, transaction);
    }

    return demo.created(transaction.id);
  }),

  demo.route('PUT', '/transactions/:transactionId/accept', (context) => {
    complete(context.state, findPayerTransaction(context));

    return demo.noContent();
  }),

  demo.route('PUT', '/transactions/:transactionId/cancel', (context) => {
    findPayerTransaction(context).status = TransactionStatus.canceled;

    return demo.noContent();
  }),
];

function findPayerTransaction({ state, params, member }: demo.Context) {
  const transaction =
    state.transactions.find(({ id }) => id === params.transactionId) ?? demo.notFound('Transaction');

  if (transaction.payerId !== member().id) {
    throw new demo.Error(403, 'Member must be the payer to accept or cancel the transaction');
  }

  if (transaction.status !== TransactionStatus.pending) {
    throw new demo.Error(400, 'Transaction status must be pending');
  }

  return transaction;
}

function complete(state: demo.State, transaction: demo.Transaction) {
  transaction.status = TransactionStatus.completed;
  transaction.completedAt = new Date().toISOString();

  demo.findMember(state, transaction.payerId).balance -= transaction.amount;
  demo.findMember(state, transaction.recipientId).balance += transaction.amount;
}
