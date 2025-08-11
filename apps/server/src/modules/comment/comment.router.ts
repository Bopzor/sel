import * as shared from '@sel/shared';
import { eq } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { Comment } from 'src/modules/comment/comment.entities';
import { createComment } from 'src/modules/comment/domain/create-comment.command';
import { MemberWithAvatar, withAvatar } from 'src/modules/member/member.entities';
import { serializeMember } from 'src/modules/member/member.serializer';
import { MessageWithAttachments, withAttachments } from 'src/modules/messages/message.entities';
import { serializeMessage } from 'src/modules/messages/message.serializer';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

export const router = express.Router();

router.get('/', async (req, res) => {
  const query = shared.getCommentsQuerySchema.parse(req.query);

  const comments = await db.query.comments.findMany({
    where: eq(schema.comments[`${query.entityType}Id`], query.entityId),
    with: {
      author: withAvatar,
      message: withAttachments,
    },
    orderBy: (comment, { asc }) => asc(comment.date),
  });

  res.json(comments.map(serializeComment));
});

router.post('/', async (req, res) => {
  const body = shared.createCommentBodySchema.parse(req.body);
  const member = getAuthenticatedMember();
  const commentId = container.resolve(TOKENS.generator).id();

  await createComment({
    commentId,
    authorId: member.id,
    ...body,
  });

  res.status(HttpStatus.created).send(commentId);
});

function serializeComment(
  this: void,
  comment: Comment & { author: MemberWithAvatar; message: MessageWithAttachments },
): shared.Comment {
  return {
    id: comment.id,
    date: comment.date.toISOString(),
    author: serializeMember(comment.author),
    message: serializeMessage(comment.message),
  };
}
