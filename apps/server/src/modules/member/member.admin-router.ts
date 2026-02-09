import * as shared from '@sel/shared';
import express from 'express';
import { NotFound } from 'src/infrastructure/http';
import { db } from 'src/persistence';

import { File } from '../file/file.entity';

import { Member } from './member.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const { sort = 'name', order = 'asc' } = shared.listAdminMembersQuerySchema.parse(req.query);

  const members = await db.query.members.findMany({
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
    where: (members, { eq }) => eq(members.id, req.params.memberId),
    with: {
      avatar: true,
    },
  });

  if (!member) {
    throw new NotFound('Member not found');
  }

  res.json(serializeAdminMember(member));
});

function serializeAdminMember(member: Member & { avatar: File | null }): shared.AdminMember {
  return {
    id: member.id,
    status: member.status,
    firstName: member.firstName,
    lastName: member.lastName,
    number: member.number,
    email: member.email,
    phoneNumbers: member.phoneNumbers,
    avatar: member.avatar?.name,
    balance: member.balance,
  };
}
