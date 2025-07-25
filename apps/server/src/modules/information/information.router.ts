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

import { createInformationComment } from './domain/create-information-comment.command';
import { createInformation } from './domain/create-information.command';
import { Information } from './information.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const information = await db.query.information.findMany({
    with: { author: withAvatar, comments: { with: { author: withAvatar } } },
    orderBy: desc(schema.information.publishedAt),
  });

  res.json(information.map(serializeInformation));
});

router.get('/:informationId', async (req, res) => {
  const informationId = req.params.informationId;

  const information = await db.query.information.findFirst({
    with: { author: withAvatar, comments: { with: { author: withAvatar } } },
    where: eq(schema.information.id, informationId),
  });

  if (!information) {
    throw new NotFound('Information not found');
  }

  res.json(serializeInformation(information));
});

router.post('/', async (req, res) => {
  const { title, body } = shared.createInformationBodySchema.parse(req.body);
  const id = container.resolve(TOKENS.generator).id();
  const member = getAuthenticatedMember();

  await createInformation({
    informationId: id,
    authorId: member.id,
    title,
    body,
  });

  res.status(HttpStatus.created).send(id);
});

router.post('/:informationId/comment', async (req, res) => {
  const informationId = req.params.informationId;
  const member = getAuthenticatedMember();
  const data = shared.createCommentBodySchema.parse(req.body);
  const commentId = container.resolve(TOKENS.generator).id();

  await createInformationComment({
    commentId,
    informationId,
    authorId: member.id,
    body: data.body,
  });

  res.status(HttpStatus.created).send(commentId);
});

function serializeInformation(
  this: void,
  information: Information & {
    author: MemberWithAvatar | null;
    comments: Array<Comment & { author: MemberWithAvatar }>;
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
    body: information.html,
    publishedAt: information.publishedAt.toISOString(),
    author: author(),
    comments: information.comments.map((comment) => ({
      id: comment.id,
      date: comment.date.toISOString(),
      author: serializeMember(comment.author),
      body: comment.html,
    })),
  };
}
