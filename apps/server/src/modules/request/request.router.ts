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

import { Comment } from '../comment';
import { MemberWithAvatar, withAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { MessageWithAttachments, withAttachments } from '../messages/message.entities';
import { serializeMessage } from '../messages/message.serializer';
import { createTransaction } from '../transaction/domain/create-transaction.command';
import { Transaction } from '../transaction/transaction.entities';

import { changeRequestStatus } from './domain/change-request-status.command';
import { createRequest } from './domain/create-request.command';
import { editRequest } from './domain/edit-request.command';
import { setRequestAnswer } from './domain/set-request-answer.command';
import { Request, RequestAnswer } from './request.entities';
import { findRequestById } from './request.persistence';

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
      requester: withAvatar,
      message: withAttachments,
      answers: {
        with: {
          member: withAvatar,
        },
      },
      comments: {
        with: {
          author: withAvatar,
          message: withAttachments,
        },
      },
      transactions: true,
    },
    orderBy: [sql`position`, desc(schema.requests.createdAt)],
  });

  res.json(results.map(serializeRequest));
});

router.get('/:requestId', async (req, res) => {
  const request = await db.query.requests.findFirst({
    where: eq(schema.requests.id, req.params.requestId),
    with: {
      requester: withAvatar,
      message: withAttachments,
      answers: {
        with: {
          member: withAvatar,
        },
      },
      comments: {
        with: {
          author: withAvatar,
          message: withAttachments,
        },
      },
      transactions: true,
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
  const body = shared.createRequestBodySchema.parse(req.body);

  await createRequest({
    requestId,
    requesterId: member.id,
    ...body,
    fileIds: body.fileIds ?? [],
  });

  res.status(HttpStatus.created).send(requestId);
});

router.put('/:requestId', isRequester, async (req, res) => {
  const requestId = req.params.requestId;
  const body = shared.updateRequestBodySchema.parse(req.body);

  await editRequest({
    requestId,
    ...body,
    fileIds: body.fileIds ?? [],
  });

  res.status(HttpStatus.noContent).end();
});

router.post('/:requestId/answer', async (req, res) => {
  const requestId = req.params.requestId;
  const member = getAuthenticatedMember();
  const body = shared.setRequestAnswerBodySchema.parse(req.body);

  await setRequestAnswer({
    requestId,
    memberId: member.id,
    ...body,
  });

  res.status(HttpStatus.noContent).end();
});

router.put('/:requestId/fulfil', isRequester, async (req, res) => {
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

  await createTransaction({
    transactionId,
    payerId: request.requesterId,
    creatorId: member.id,
    requestId: request.id,
    ...body,
  });

  res.send(transactionId);
});

function serializeRequest(
  request: Request & {
    requester: MemberWithAvatar;
    message: MessageWithAttachments;
    comments: Array<Comment & { author: MemberWithAvatar; message: MessageWithAttachments }>;
    answers: Array<RequestAnswer & { member: MemberWithAvatar }>;
    transactions: Array<Transaction>;
  },
): shared.Request {
  const { requester, comments, answers } = request;

  return {
    id: request.id,
    status: request.status,
    date: request.date.toISOString(),
    requester: {
      ...serializeMember(requester),
      email: requester.emailVisible ? requester.email : undefined,
      phoneNumbers: (requester.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
    },
    title: request.title,
    message: serializeMessage(request.message),
    hasTransactions: request.transactions.length > 0,
    answers: answers.map((answer) => ({
      id: answer.id,
      member: serializeMember(answer.member),
      answer: answer.answer,
    })),
    comments: comments.map((comment) => ({
      id: comment.id,
      date: comment.date.toISOString(),
      author: serializeMember(comment.author),
      message: serializeMessage(comment.message),
    })),
  };
}
