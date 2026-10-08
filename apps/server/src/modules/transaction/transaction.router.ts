import * as shared from '@sel/shared';
import { hasProperty, not } from '@sel/utils';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberWithAvatar, withAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { Request } from '../request/request.entities';

import { acceptTransaction } from './domain/accept-transaction.command';
import { cancelTransaction } from './domain/cancel-transaction.command';
import { createTransaction } from './domain/create-transaction.command';
import { Transaction } from './transaction.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const { memberId } = shared.listTransactionsQuerySchema.parse(req.query);

  const results = await db.query.transactions.findMany({
    where: memberId ? { OR: [{ payerId: memberId }, { recipientId: memberId }] } : {},
    with: {
      payer: withAvatar,
      recipient: withAvatar,
      request: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.send(
    [
      ...results.filter(hasProperty('status', shared.TransactionStatus.pending)),
      ...results.filter(not(hasProperty('status', shared.TransactionStatus.pending))),
    ].map(serializeTransaction),
  );
});

router.get('/:transactionId', async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await db.query.transactions.findFirst({
    where: { id: transactionId },
    with: {
      payer: withAvatar,
      recipient: withAvatar,
      request: true,
    },
  });

  if (!transaction) {
    throw new NotFound('Transaction not found');
  }

  res.send(serializeTransaction(transaction));
});

router.post('/', async (req, res) => {
  const transactionId = container.resolve(TOKENS.generator).id();
  const member = getAuthenticatedMember();
  const body = shared.createTransactionBodySchema.parse(req.body);

  await createTransaction({
    transactionId,
    description: body.description,
    amount: body.amount,
    payerId: body.payerId,
    recipientId: body.recipientId,
    creatorId: member.id,
    comment: body.comment,
    requestId: body.requestId,
  });

  res.status(HttpStatus.created).send(transactionId);
});

router.put('/:transactionId/accept', async (req, res) => {
  const { transactionId } = req.params;
  const member = getAuthenticatedMember();

  await acceptTransaction({
    transactionId,
    memberId: member.id,
  });

  res.end();
});

router.put('/:transactionId/cancel', async (req, res) => {
  const { transactionId } = req.params;
  const member = getAuthenticatedMember();

  await cancelTransaction({
    transactionId,
    memberId: member.id,
  });

  res.end();
});

function serializeTransaction(
  this: void,
  transaction: Transaction & Record<'payer' | 'recipient', MemberWithAvatar> & { request: Request | null },
): shared.Transaction {
  return {
    id: transaction.id,
    status: transaction.status,
    amount: transaction.amount,
    description: transaction.description,
    payer: serializeMember(transaction.payer),
    recipient: serializeMember(transaction.recipient),
    payerComment: transaction.payerComment ?? undefined,
    recipientComment: transaction.recipientComment ?? undefined,
    request: transaction.request
      ? { id: transaction.request.id, title: transaction.request.title }
      : undefined,
    date: (transaction.completedAt ?? transaction.createdAt).toISOString(),
  };
}
