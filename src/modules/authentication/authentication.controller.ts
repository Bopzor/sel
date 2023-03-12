/* eslint-disable @typescript-eslint/no-misused-promises */

import { Router } from 'express';

import { container } from '../../api/container';
import { TOKENS } from '../../api/tokens';
import { assert } from '../../utils/assert';

export const router = Router();

router.get('/me', async (req, res) => {
  const { memberId } = req.session;

  if (!memberId) {
    res.status(401);
    res.end();
    return;
  }

  const handler = container.get(TOKENS.getMemberHandler);
  const result = await handler.handle({ id: memberId });

  assert(result, 'no member associated to this session token');

  res.status(200);
  res.json(result);
});

router.post('/login', (req, res) => {
  const { memberId } = req.body;

  req.session.memberId = memberId;

  res.status(204);
  res.end();
});
