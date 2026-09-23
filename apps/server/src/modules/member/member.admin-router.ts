import * as shared from '@sel/shared';
import { and, eq, exists, gt, lt } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus, NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { File } from '../file/file.entity';

import { createMembershipPayment } from './domain/create-membership-payment.command';
import { Member } from './member.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const { sort = 'name', order = 'asc' } = shared.listAdminMembersQuerySchema.parse(req.query);

  const members = await db.query.members.findMany({
    extras: {
      isMembershipUpToDate: isMembershipUpToDate(),
    },
    orderBy: ({ number, firstName, balance }, { asc, desc }) => {
      const column = { number, name: firstName, balance }[sort];
      const fn = { asc, desc }[order];

      return fn(column);
    },
    with: {
      avatar: true,
    },
  });

  res.json(members.map(serializeAdminMember));
});

router.get('/:memberId', async (req, res) => {
  const member = await db.query.members.findFirst({
    where: { id: req.params.memberId },
    extras: {
      isMembershipUpToDate: isMembershipUpToDate(),
    },
    with: {
      avatar: true,
    },
  });

  if (!member) {
    throw new NotFound('Member not found');
  }

  res.json(serializeAdminMember(member));
});

router.post('/:memberId/membership-payment', async (req, res) => {
  const generator = container.resolve(TOKENS.generator);
  const body = shared.createMembershipPaymentBodySchema.parse(req.body);

  const member = await db.query.members.findFirst({
    where: { id: req.params.memberId },
  });

  if (!member) {
    throw new NotFound('Member not found');
  }

  const paymentId = generator.id();

  await createMembershipPayment({
    paymentId,
    memberId: member.id,
    ...body,
  });

  res.status(HttpStatus.noContent).end();
});

function isMembershipUpToDate() {
  const now = container.resolve(TOKENS.date).now();
  const payment = schema.membershipPayment;

  return (member: typeof schema.members) =>
    exists(
      db
        .select()
        .from(payment)
        .where(
          and(eq(payment.memberId, member.id), lt(payment.periodStart, now), gt(payment.periodEnd, now)),
        ),
    ).mapWith(Boolean);
}

function serializeAdminMember(
  member: Member & { avatar: File | null; isMembershipUpToDate: boolean },
): shared.AdminMember {
  return {
    id: member.id,
    status: member.status,
    isMembershipUpToDate: member.isMembershipUpToDate,
    firstName: member.firstName,
    lastName: member.lastName,
    number: member.number,
    email: member.email,
    phoneNumber: member.phoneNumber ?? undefined,
    avatar: member.avatar?.name,
    balance: member.balance,
  };
}
