import * as shared from '@sel/shared';
import { pick } from '@sel/utils';
import { desc, eq } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberWithAvatar, withAvatar } from '../member/member.entities';

import { createInformation } from './domain/create-information.command';
import { Information } from './information.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const [pinMessages, notPinMessages] = await Promise.all(
    [true, false].map((isPin) =>
      db.query.information.findMany({
        with: { author: withAvatar },
        where: eq(schema.information.isPin, isPin),
        orderBy: desc(schema.information.publishedAt),
      }),
    ),
  );

  res.json({
    pin: pinMessages.map(serializeInformation),
    notPin: notPinMessages.map(serializeInformation),
  });
});

router.post('/', async (req, res) => {
  const { isPin, body } = shared.createInformationBodySchema.parse(req.body);
  const id = container.resolve(TOKENS.generator).id();
  const member = getAuthenticatedMember();

  await createInformation({
    informationId: id,
    authorId: member.id,
    body,
    isPin: isPin ?? false,
  });

  res.status(201).send(id);
});

function serializeInformation(
  this: void,
  information: Information & { author: MemberWithAvatar | null },
): shared.Information {
  const author = () => {
    if (information.author) {
      return {
        ...pick(information.author, ['id', 'firstName', 'lastName']),
        avatar: information.author.avatar?.name,
      };
    }
  };

  return {
    id: information.id,
    body: information.html,
    publishedAt: information.publishedAt.toISOString(),
    author: author(),
  };
}
