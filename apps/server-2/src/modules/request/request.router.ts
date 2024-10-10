import { AsyncLocalStorage } from 'node:async_hooks';

import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { desc, eq, sql } from 'drizzle-orm';
import express, { RequestHandler } from 'express';

import { container } from 'src/infrastructure/container';
import { Forbidden, HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { comment } from '../comment/comment.entities';
import { Member } from '../member/member.entities';

import { changeRequestStatus } from './change-request-status.command';
import { createRequestComment } from './create-request-comment.command';
import { createRequest } from './create-request.command';
import { editRequest } from './edit-request.command';
import { Request, RequestAnswer } from './request.entities';
import { findRequestById } from './request.persistence';
import { setRequestAnswer } from './set-request-answer.command';

export const router = express.Router();

const requestContext = new AsyncLocalStorage<Request>();
const getRequest = () => defined(requestContext.getStore());

const isRequester: RequestHandler<{ requestId: string }> = async (req, res, next) => {
  const member = getAuthenticatedMember();
  const request = getRequest();

  if (request.requesterId !== member.id) {
    throw new Forbidden('Member must be the author of the request');
  }

  next();
};

router.get('/', async (req, res) => {
  const results = await db.query.requests.findMany({
    extras: {
      position: sql`case status when 'pending' then 1 else 2 end`.as('position'),
    },
    with: {
      requester: true,
      answers: {
        with: {
          member: true,
        },
      },
      comments: {
        with: {
          author: true,
        },
      },
    },
    orderBy: [sql`position`, desc(schema.requests.createdAt)],
  });

  res.json(results.map(serializeRequest));
});

router.get('/:requestId', async (req, res) => {
  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, req.params.requestId),
    with: {
      requester: true,
      answers: {
        with: {
          member: true,
        },
      },
      comments: {
        with: {
          author: true,
        },
      },
    },
  });

  if (!request) {
    throw new NotFound('Request not found');
  }

  res.json(serializeRequest(request));
});

router.param('requestId', async (req, res, next) => {
  const request = await findRequestById(req.params.requestId);

  if (!request) {
    next();
  } else {
    requestContext.run(request, next);
  }
});

router.post('/', async (req, res) => {
  const requestId = container.resolve(TOKENS.generator).id();
  const member = getAuthenticatedMember();
  const data = shared.createRequestBodySchema.parse(req.body);

  await createRequest({
    requestId,
    requesterId: member.id,
    ...data,
  });

  res.status(HttpStatus.created).send(requestId);
});

router.put('/:requestId', isRequester, async (req, res) => {
  const requestId = req.params.requestId;
  const data = shared.updateRequestBodySchema.parse(req.body);

  await editRequest({
    requestId,
    ...data,
  });

  res.status(HttpStatus.noContent).end();
});

router.post('/:requestId/comment', async (req, res) => {
  const commentId = container.resolve(TOKENS.generator).id();
  const requestId = req.params.requestId;
  const member = getAuthenticatedMember();
  const data = shared.createCommentBodySchema.parse(req.body);

  await createRequestComment({
    commentId,
    requestId,
    authorId: member.id,
    body: data.body,
  });

  res.status(HttpStatus.created).send(commentId);
});

router.post('/:requestId/answer', async (req, res) => {
  const requestId = req.params.requestId;
  const member = getAuthenticatedMember();
  const data = shared.setRequestAnswerBodySchema.parse(req.body);

  await setRequestAnswer({
    requestId,
    memberId: member.id,
    answer: data.answer,
  });

  res.status(HttpStatus.noContent).end();
});

router.put('/:requestId/fulfill', isRequester, async (req, res) => {
  const requestId = req.params.requestId;

  await changeRequestStatus({
    requestId,
    status: shared.RequestStatus.fulfilled,
  });

  res.status(HttpStatus.noContent).end();
});

router.put('/:requestId/cancel', isRequester, async (req, res) => {
  const requestId = req.params.requestId;

  await changeRequestStatus({
    requestId,
    status: shared.RequestStatus.canceled,
  });

  res.status(HttpStatus.noContent).end();
});

router.post('/:requestId/transaction', async (req, res) => {
  const member = getAuthenticatedMember();
  const request = getRequest();
  const transactionId = container.resolve(TOKENS.generator).id();
  const body = shared.createRequestTransactionBodySchema.parse(req.body);

  // todo
  // await createTransaction({
  //   transactionId,
  //   payerId: request.requesterId,
  //   creatorId: member.id,
  //   requestId: request.id,
  //   ...body,
  // });

  res.send(transactionId);
});

function serializeRequest(
  request: Request & {
    requester: Member;
    comments: Array<comment & { author: Member }>;
    answers: Array<RequestAnswer & { member: Member }>;
  },
): shared.Request {
  const { requester, comments, answers } = request;

  return {
    id: request.id,
    status: request.status,
    date: request.date.toISOString(),
    requester: {
      id: requester.id,
      firstName: requester.firstName,
      lastName: requester.lastName,
      email: requester.emailVisible ? requester.email : undefined,
      phoneNumbers: (requester.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
    },
    title: request.title,
    body: request.html,
    answers: answers.map((answer) => ({
      id: answer.id,
      member: {
        id: answer.member.id,
        firstName: answer.member.firstName,
        lastName: answer.member.lastName,
      },
      answer: answer.answer,
    })),
    comments: comments.map((comment) => ({
      id: comment.id,
      date: comment.date.toISOString(),
      author: {
        id: comment.author.id,
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
      },
      body: comment.html,
    })),
  };
}
