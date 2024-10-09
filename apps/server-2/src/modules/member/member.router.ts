import * as shared from '@sel/shared';
import express from 'express';

import { generateId } from 'src/infrastructure/generator';

import { createMember } from './create-member.command';

export const router = express.Router();

router.post('/', async (req, res) => {
  const memberId = generateId();
  const body = shared.createMemberBodySchema.parse(req.body);

  await createMember({ memberId, ...body });

  res.status(201).send(memberId);
});
