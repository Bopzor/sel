import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';

import * as shared from '@sel/shared';
import { defined, pick } from '@sel/utils';
import { and, eq, or } from 'drizzle-orm';
import express, { RequestHandler } from 'express';

import { container } from 'src/infrastructure/container';
import { Forbidden, HttpStatus, NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { createMember } from './create-member.command';
import { Member } from './member.entities';
import { findMemberById } from './member.persistence';
import { updateMemberProfile } from './update-member-profile.command';

export const router = express.Router();

const memberContext = new AsyncLocalStorage<Member>();
const getMember = () => defined(memberContext.getStore());

const isAuthenticatedMember: RequestHandler<{ memberId: string }> = (req, res, next) => {
  const authenticatedMember = getMember();
  const memberId = req.params.memberId;

  if (authenticatedMember.id !== memberId) {
    throw new Forbidden();
  }

  next();
};

router.param('memberId', async (req, res, next) => {
  const member = await findMemberById(req.params.memberId);

  if (!member) {
    return next(new NotFound('Member not found'));
  }

  memberContext.run(member, next);
});

router.get('/', async (req, res) => {
  const members = await db.query.members.findMany();

  res.json(members.map(serializeMember));
});

router.post('/', async (req, res) => {
  const generator = container.resolve(TOKENS.generator);

  const memberId = generator.id();
  const body = shared.createMemberBodySchema.parse(req.body);

  await createMember({ memberId, ...body });

  res.status(201).send(memberId);
});

router.get('/:memberId', (req, res) => {
  res.json(serializeMember(getMember()));
});

router.get('/:memberId/avatar', (req, res) => {
  const { email } = getMember();
  const hash = crypto.createHash('sha256').update(email).digest('hex');

  const search = new URL(req.url, `http://${req.hostname}`).search;
  const url = `https://www.gravatar.com/avatar/${hash}${search}`;

  res.status(HttpStatus.permanentRedirect).header('Location', url).end();
});

router.get('/:memberId/transactions', async (req, res) => {
  const { id: memberId } = getMember();

  const transactions = await db.query.transactions.findMany({
    where: and(
      or(eq(schema.transactions.payerId, memberId), eq(schema.transactions.recipientId, memberId)),
      eq(schema.transactions.status, shared.TransactionStatus.completed),
    ),
    with: {
      payer: true,
      recipient: true,
    },
  });

  res.json(transactions.map(serializeTransaction));
});

router.put('/:memberId/profile', isAuthenticatedMember, async (req, res) => {
  const { id: memberId } = getMember();
  const data = shared.updateMemberProfileBodySchema.parse(req.body);

  await updateMemberProfile({ memberId, data });

  res.end();
});

function serializeMember(member: Member): shared.Member {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    bio: member.bio ?? undefined,
    address: member.address ?? undefined,
    email: member.emailVisible ? member.email : undefined,
    phoneNumbers: member.phoneNumbers.filter(({ visible }) => visible),
    membershipStartDate: member.membershipStartDate?.toISOString(),
    balance: member.balance,
    interests: [], // todo
  };
}

function serializeTransaction(
  transaction: typeof schema.transactions.$inferSelect & { payer: Member; recipient: Member },
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
