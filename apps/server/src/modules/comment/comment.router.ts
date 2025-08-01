import * as shared from '@sel/shared';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { TOKENS } from 'src/tokens';

import { createComment } from './domain/create-comment.command';

export const router = express.Router();

router.post('/', async (req, res) => {
  const body = shared.createCommentBodyWithEntitySchema.parse(req.body);
  const member = getAuthenticatedMember();
  const commentId = container.resolve(TOKENS.generator).id();

  await createComment({
    commentId,
    authorId: member.id,
    ...body,
  });

  res.status(HttpStatus.created).send(commentId);
});
