import * as shared from '@sel/shared';
import { asc } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { File } from '../file/file.entity';
import { MemberWithAvatar, withAvatar } from '../member/member.entities';

import { addInterestMember } from './domain/add-interest-member.command';
import { createInterest } from './domain/create-interest.command';
import { editInterestMember } from './domain/edit-interest-member.command';
import { removeInterestMember } from './domain/remove-interest-member.command';
import { updateInterest } from './domain/update-interest.command';
import { Interest, MemberInterest } from './interest.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const interests = await db.query.interests.findMany({
    orderBy: asc(schema.interests.label),
    with: {
      image: true,
      membersInterests: {
        with: {
          member: withAvatar,
        },
      },
    },
  });

  res.json(interests.map(serializeInterest));
});

router.post('/', async (req, res) => {
  const interestId = container.resolve(TOKENS.generator).id();
  const { label, description, imageId } = shared.createInterestBodySchema.parse(req.body);

  await createInterest({
    interestId,
    label,
    description,
    imageId,
  });

  res.status(HttpStatus.created).send(interestId);
});

router.put('/:interestId', async (req, res) => {
  const interestId = req.params.interestId;
  const { label, description, imageId } = shared.updateInterestBodySchema.parse(req.body);

  await updateInterest({
    interestId,
    label,
    description,
    imageId,
  });

  res.status(HttpStatus.noContent).send(interestId);
});

router.put('/:interestId/join', async (req, res) => {
  const interestId = req.params.interestId;
  const { id: memberId } = getAuthenticatedMember();
  const { description } = shared.addInterestMemberBodySchema.parse(req.body);

  await addInterestMember({
    interestId,
    memberId,
    description,
  });

  res.end();
});

router.put('/:interestId/leave', async (req, res) => {
  const interestId = req.params.interestId;
  const { id: memberId } = getAuthenticatedMember();

  await removeInterestMember({
    interestId,
    memberId,
  });

  res.end();
});

router.put('/:interestId/edit', async (req, res) => {
  const interestId = req.params.interestId;
  const { id: memberId } = getAuthenticatedMember();
  const { description } = shared.editInterestMemberBodySchema.parse(req.body);

  await editInterestMember({
    interestId,
    memberId,
    description,
  });

  res.end();
});

function serializeInterest(
  interest: Interest & {
    membersInterests: Array<MemberInterest & { member: MemberWithAvatar }>;
    image: File | null;
  },
): shared.Interest {
  return {
    id: interest.id,
    label: interest.label,
    description: interest.description,
    image: interest.image?.name ?? '',
    members: interest.membersInterests.map((memberInterest) => ({
      id: memberInterest.member.id,
      firstName: memberInterest.member.firstName,
      lastName: memberInterest.member.lastName,
      avatar: memberInterest.member.avatar?.name,
      description: memberInterest.description ?? undefined,
    })),
  };
}
