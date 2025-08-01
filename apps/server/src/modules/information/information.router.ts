import * as shared from '@sel/shared';
import { desc, eq } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { Comment } from '../comment';
import { MemberWithAvatar, withAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { MessageWithAttachments, withAttachments } from '../messages/message.entities';
import { serializeMessage } from '../messages/message.serializer';

import { createInformation } from './domain/create-information.command';
import { Information } from './information.entities';

export const router = express.Router();

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

router.get('/:informationId', async (req, res) => {
  const informationId = req.params.informationId;

  const information = await db.query.information.findFirst({
    with: {
      author: withAvatar,
      message: withAttachments,
      comments: {
        with: { author: withAvatar, message: withAttachments },
      },
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
    fileIds: body.fileIds ?? [],
  });

  res.status(HttpStatus.created).send(id);
});

function serializeInformation(
  this: void,
  information: Information & {
    author: MemberWithAvatar | null;
    message: MessageWithAttachments;
    comments: Array<Comment & { author: MemberWithAvatar; message: MessageWithAttachments }>;
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
    comments: information.comments.map((comment) => ({
      id: comment.id,
      date: comment.date.toISOString(),
      author: serializeMember(comment.author),
      message: serializeMessage(comment.message),
    })),
  };
}
