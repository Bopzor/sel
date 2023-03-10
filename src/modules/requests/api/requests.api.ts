/* eslint-disable @typescript-eslint/no-misused-promises */

import { Router } from 'express';

import { container } from '../../../app/container';
import { TOKENS } from '../../../tokens';
import { ListRequestsQuery } from '../use-cases/list-requests/list-requests';

export const router = Router();

router.get('/', async (req, res) => {
  const handler = container.get(TOKENS.listRequestsHandler);

  const query: ListRequestsQuery = {};
  const search = req.query.search;

  if (typeof search === 'string') {
    query.search = search;
  }

  const requests = await handler.handle(query);

  res.json(requests);
});

router.get('/:requestId', async (req, res) => {
  const handler = container.get(TOKENS.getRequestHandler);

  const request = await handler.handle({ id: req.params.requestId });

  if (!request) {
    res.status(404).end();
    return;
  }

  res.json(request);
});
