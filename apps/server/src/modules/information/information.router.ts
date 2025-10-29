import { AsyncLocalStorage } from 'node:async_hooks';

import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { desc, eq } from 'drizzle-orm';
import express, { RequestHandler } from 'express';

import { container } from 'src/infrastructure/container';
import { Forbidden, HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberWithAvatar, withAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { MessageWithAttachments, withAttachments } from '../messages/message.entities';
import { serializeMessage } from '../messages/message.serializer';

import { createInformation } from './domain/create-information.command';
import { updateInformation } from './domain/update-information.command';
import { Information } from './information.entities';
import { findInformationById } from './information.persistence';

export const router = express.Router();

const informationContext = new AsyncLocalStorage<Information>();
const getInformation = () => defined(informationContext.getStore());

const isAuthor: RequestHandler<{ informationId: string }> = async (req, res, next) => {
  const member = getAuthenticatedMember();
  const information = getInformation();

  if (information.authorId !== member.id) {
    throw new Forbidden('Member must be the author of the information');
  }

  next();
};

router.get('/', async (req, res) => {
  const information = await db.query.information.findMany({
    with: {
      author: withAvatar,
      message: withAttachments,
      comments: {
        with: { author: withAvatar, message: withAttachments },
      },
    },
    orderBy: desc(schema.information.publishedAt),
  });

  res.json(information.map(serializeInformation));
});

router.param('informationId', async (req, res, next) => {
  const information = await findInformationById(req.params.informationId);

  if (!information) {
    next();
  } else {
    informationContext.run(information, next);
  }
});

router.get('/:informationId', async (req, res) => {
  const informationId = req.params.informationId;

  const information = await db.query.information.findFirst({
    with: {
      author: withAvatar,
      message: withAttachments,
    },
    where: eq(schema.information.id, informationId),
  });

  if (!information) {
    throw new NotFound('Information not found');
  }

  res.json(serializeInformation(information));
});

router.post('/', async (req, res) => {
  const body = shared.createInformationBodySchema.parse(req.body);
  const id = container.resolve(TOKENS.generator).id();
  const member = getAuthenticatedMember();

  await createInformation({
    informationId: id,
    authorId: member.id,
    ...body,
  });

  res.status(HttpStatus.created).send(id);
});

router.put('/:informationId', isAuthor, async (req, res) => {
  const informationId = req.params.informationId;
  const body = shared.updateInformationBodySchema.parse(req.body);

  await updateInformation({
    informationId,
    ...body,
    fileIds: body.fileIds ?? [],
  });

  res.status(HttpStatus.noContent).end();
});

function serializeInformation(
  this: void,
  information: Information & {
    author: MemberWithAvatar | null;
    message: MessageWithAttachments;
  },
): shared.Information {
  const author = () => {
    if (information.author) {
      return serializeMember(information.author);
    }
  };

  return {
    id: information.id,
    title: information.title,
    message: serializeMessage(information.message),
    publishedAt: information.publishedAt.toISOString(),
    author: author(),
  };
}
