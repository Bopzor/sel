import * as shared from '@sel/shared';
import express from 'express';

import { db } from 'src/persistence';

import { File } from '../file/file.entity';

import { Member } from './member.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const members = await db.query.members.findMany({
    with: {
      avatar: true,
    },
  });

  res.json(members.map(serializeAdminMember));
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
