import * as shared from '@sel/shared';
import { pick } from '@sel/utils';
import { desc, eq } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { Member } from '../member';

import { createInformation } from './commands/create-information.command';
import { Information } from './information.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const [pinMessages, notPinMessages] = await Promise.all(
    [true, false].map((isPin) =>
      db.query.information.findMany({
        with: { author: true },
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
  information: Information & { author: Member | null },
): shared.Information {
  return {
    id: information.id,
    body: information.html,
    publishedAt: information.publishedAt.toISOString(),
    author: information.author ? pick(information.author, ['id', 'firstName', 'lastName']) : undefined,
  };
}
