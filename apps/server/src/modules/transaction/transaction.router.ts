import * as shared from '@sel/shared';
import { hasProperty, not, pick } from '@sel/utils';
import { desc, eq, or } from 'drizzle-orm';
import express from 'express';
import { z } from 'zod';

import { container } from 'src/infrastructure/container';
import { HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { Member } from '../member';

import { acceptTransaction } from './domain/accept-transaction.command';
import { cancelTransaction } from './domain/cancel-transaction.command';
import { createTransaction } from './domain/create-transaction.command';
import { Transaction } from './transaction.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const { memberId } = z.object({ memberId: z.string() }).parse(req.query);

  const results = await db.query.transactions.findMany({
    where: memberId
      ? or(eq(schema.transactions.payerId, memberId), eq(schema.transactions.recipientId, memberId))
      : undefined,
    with: {
      payer: true,
      recipient: true,
    },
    orderBy: desc(schema.transactions.createdAt),
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
    where: eq(schema.transactions.id, transactionId),
    with: {
      payer: true,
      recipient: true,
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
  transaction: Transaction & Record<'payer' | 'recipient', Member>,
): shared.Transaction {
  return {
    id: transaction.id,
    status: transaction.status,
    amount: transaction.amount,
    description: transaction.description,
    payer: pick(transaction.payer, ['id', 'firstName', 'lastName']),
    recipient: pick(transaction.recipient, ['id', 'firstName', 'lastName']),
    date: transaction.createdAt.toISOString(),
  };
}