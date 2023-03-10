/* eslint-disable @typescript-eslint/no-misused-promises */

import { Router } from 'express';

import { container } from '../../../api/container';
import { TOKENS } from '../../../api/tokens';
import { createRequestBody } from '../shared/create-request-body.schema';
import { editRequestBody } from '../shared/edit-request-body.schema';
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

router.post('/', async (req, res) => {
  const command = await createRequestBody.validate(req.body, { abortEarly: false });
  const handler = container.get(TOKENS.createRequestHandler);

  await handler.handle({
    requesterId: 'member01',
    ...command,
  });

  res.status(201).end();
});

router.put('/:requestId', async (req, res) => {
  const command = await editRequestBody.validate(req.body, { abortEarly: false });
  const handler = container.get(TOKENS.editRequestHandler);

  await handler.handle({
    id: req.params.requestId,
    ...command,
  });

  res.status(204).end();
});
