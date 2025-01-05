import { AsyncLocalStorage } from 'node:async_hooks';

import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { and, asc, desc, eq, or } from 'drizzle-orm';
import express, { RequestHandler } from 'express';

import { container } from 'src/infrastructure/container';
import { Forbidden, HttpStatus, NotFound } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { File } from '../file/file.entity';
import { Interest, MemberInterest } from '../interest/interest.entities';

import { changeNotificationDeliveryType } from './domain/change-notification-delivery-type.command';
import { createMember } from './domain/create-member.command';
import { updateMemberProfile } from './domain/update-member-profile.command';
import { Member, MemberWithAvatar, withAvatar } from './member.entities';
import { findMemberById } from './member.persistence';
import { serializeMember } from './member.serializer';

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
  const { sort } = shared.listMembersQuerySchema.parse(req.query);

  const orderBy = {
    [shared.MembersSort.firstName]: asc(schema.members.firstName),
    [shared.MembersSort.lastName]: asc(schema.members.lastName),
    [shared.MembersSort.membershipDate]: desc(schema.members.membershipStartDate),
  };

  const members = await db.query.members.findMany({
    where: eq(schema.members.status, shared.MemberStatus.active),
    orderBy: sort ? orderBy[sort] : undefined,
    with: {
      avatar: true,
      memberInterests: {
        with: { interest: true },
      },
    },
  });

  res.json(members.map(serializeMemberFull));
});

router.post('/', async (req, res) => {
  const generator = container.resolve(TOKENS.generator);

  const memberId = generator.id();
  const body = shared.createMemberBodySchema.parse(req.body);

  await createMember({ memberId, ...body });

  res.status(201).send(memberId);
});

router.get('/:memberId', async (req, res) => {
  const member = await db.query.members.findFirst({
    where: and(
      eq(schema.members.id, req.params.memberId),
      eq(schema.members.status, shared.MemberStatus.active),
    ),
    with: {
      avatar: true,
      memberInterests: {
        with: { interest: true },
      },
    },
  });

  if (member === undefined) {
    throw new NotFound('Member not found');
  }

  res.json(serializeMemberFull(member));
});

router.get('/:memberId/transactions', async (req, res) => {
  const { id: memberId } = getMember();

  const transactions = await db.query.transactions.findMany({
    where: and(
      or(eq(schema.transactions.payerId, memberId), eq(schema.transactions.recipientId, memberId)),
      eq(schema.transactions.status, shared.TransactionStatus.completed),
    ),
    with: {
      payer: withAvatar,
      recipient: withAvatar,
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

router.put('/:memberId/notification-delivery', isAuthenticatedMember, async (req, res) => {
  const { memberId } = req.params;
  const data = shared.notificationDeliveryBodySchema.parse(req.body);

  await changeNotificationDeliveryType({
    memberId,
    notificationDeliveryType: data,
  });

  res.status(HttpStatus.noContent).end();
});

function serializeMemberFull(
  member: Member & { avatar: File | null; memberInterests: Array<MemberInterest & { interest: Interest }> },
): shared.Member {
  const compareMemberInterests = (a: shared.MemberInterest, b: shared.MemberInterest) => {
    return a.label.localeCompare(b.label);
  };

  return {
    ...serializeMember(member),
    bio: member.bio ?? undefined,
    address: member.address ?? undefined,
    email: member.emailVisible ? member.email : undefined,
    phoneNumbers: member.phoneNumbers.filter(({ visible }) => visible),
    membershipStartDate: member.membershipStartDate?.toISOString(),
    balance: member.balance,
    interests: member.memberInterests.map(serializeMemberInterest).sort(compareMemberInterests),
  };
}

function serializeMemberInterest(
  memberInterest: MemberInterest & { interest: Interest },
): shared.MemberInterest {
  return {
    id: memberInterest.id,
    interestId: memberInterest.interestId,
    label: memberInterest.interest.label,
    description: memberInterest.description ?? undefined,
  };
}

function serializeTransaction(
  transaction: typeof schema.transactions.$inferSelect & {
    payer: MemberWithAvatar;
    recipient: MemberWithAvatar;
  },
): shared.Transaction {
  return {
    id: transaction.id,
    status: transaction.status,
    amount: transaction.amount,
    description: transaction.description,
    payer: serializeMember(transaction.payer),
    recipient: serializeMember(transaction.recipient),
    date: transaction.createdAt.toISOString(),
  };
}
