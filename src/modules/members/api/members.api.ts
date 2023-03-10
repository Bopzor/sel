/* eslint-disable @typescript-eslint/no-misused-promises */

import { Router } from 'express';

import { container } from '../../../app/container';
import { TOKENS } from '../../../tokens';
import { ListMembersQuery } from '../use-cases/list-members/list-members';

export const router = Router();

router.get('/', async (req, res) => {
  const handler = container.get(TOKENS.listMembersHandler);

  const query: ListMembersQuery = {};
  const search = req.query.search;

  if (typeof search === 'string') {
    query.search = search;
  }

  const members = await handler.handle(query);

  res.json(members);
});

router.get('/:memberId', async (req, res) => {
  const handler = container.get(TOKENS.getMemberHandler);

  const member = await handler.handle({ id: req.params.memberId });

  if (!member) {
    res.status(404).end();
    return;
  }

  res.json(member);
});
