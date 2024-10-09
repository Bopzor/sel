import express from 'express';
import { z } from 'zod';

import { generateId } from 'src/infrastructure/generator';

import { createMember } from './create-member.command';

export const router = express.Router();

const createMemberBodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

router.post('/', async (req, res) => {
  const memberId = generateId();
  const body = createMemberBodySchema.parse(req.body);

  await createMember({ memberId, ...body });

  res.status(201).send(memberId);
});
