import {
  createRequestBodySchema,
  listRequestsQuerySchema,
  RequestStatus,
  setRequestAnswerBodySchema,
  updateRequestBodySchema,
  type Request,
  type RequestListItem,
} from '@sel/shared';
import { createId } from '@sel/utils';

import { demo } from '../demo';

export const demoRequestRoutes = [
  demo.route('GET', '/requests', ({ state, query }) => {
    const { search, status, requesterId, year, ...page } = listRequestsQuerySchema.parse(query);

    const requests = state.requests
      .filter((request) => search === undefined || demo.matchesSearch(search, request.title, request.message))
      .filter((request) => status === undefined || request.status === status)
      .filter((request) => requesterId === undefined || request.requesterId === requesterId)
      .filter((request) => year === undefined || new Date(request.date).getFullYear() === year)
      .toSorted((a, b) => b.date.localeCompare(a.date));

    return demo.paginated(
      requests.map((request) => serializeRequestListItem(state, request)),
      page,
    );
  }),

  demo.route('GET', '/requests/:requestId', ({ state, params }) => {
    return demo.json(serializeRequest(state, findRequest(state, params.requestId)));
  }),

  demo.route('POST', '/requests', ({ state, body, member }) => {
    const { title, body: text, fileIds } = createRequestBodySchema.parse(body);
    const id = createId();

    state.requests.push({
      id,
      status: RequestStatus.pending,
      date: new Date().toISOString(),
      requesterId: member().id,
      title,
      message: demo.createMessage(state, text, fileIds),
    });

    return demo.created(id);
  }),

  demo.route('PUT', '/requests/:requestId', (context) => {
    const request = findRequesterRequest(context);
    const { title, body, fileIds } = updateRequestBodySchema.parse(context.body);

    request.title = title;
    request.message = demo.createMessage(context.state, body, fileIds);

    return demo.noContent();
  }),

  demo.route('POST', '/requests/:requestId/answer', ({ state, params, body, member }) => {
    const request = findRequest(state, params.requestId);
    const { answer } = setRequestAnswerBodySchema.parse(body);
    const memberId = member().id;

    assertPending(request);

    if (memberId === request.requesterId) {
      throw new demo.Error(400, 'Member is requester');
    }

    state.requestAnswers = state.requestAnswers.filter(
      (requestAnswer) => requestAnswer.requestId !== request.id || requestAnswer.memberId !== memberId,
    );

    if (answer !== null) {
      state.requestAnswers.push({
        id: createId(),
        requestId: request.id,
        memberId,
        answer,
        date: new Date().toISOString(),
      });
    }

    return demo.noContent();
  }),

  demo.route('PUT', '/requests/:requestId/fulfil', (context) => {
    const request = findRequesterRequest(context);

    assertPending(request);
    request.status = RequestStatus.fulfilled;

    return demo.noContent();
  }),

  demo.route('PUT', '/requests/:requestId/cancel', (context) => {
    const request = findRequesterRequest(context);

    assertPending(request);
    request.status = RequestStatus.canceled;

    return demo.noContent();
  }),
];

function findRequest(state: demo.State, requestId = '') {
  return state.requests.find(({ id }) => id === requestId) ?? demo.notFound('Request');
}

function assertPending(request: demo.Request) {
  if (request.status !== RequestStatus.pending) {
    throw new demo.Error(400, 'Request is not pending');
  }
}

function findRequesterRequest({ state, params, member }: demo.Context) {
  const request = findRequest(state, params.requestId);

  if (request.requesterId !== member().id) {
    throw new demo.Error(403, 'Member must be the author of the request');
  }

  return request;
}

function serializeRequester(state: demo.State, request: demo.Request) {
  const requester = demo.findMember(state, request.requesterId);

  return { ...demo.serializeLightMember(requester), ...demo.serializeMemberContact(requester) };
}

function serializeRequestListItem(state: demo.State, request: demo.Request): RequestListItem {
  const answers = state.requestAnswers.filter(({ requestId }) => requestId === request.id);

  return {
    id: request.id,
    status: request.status,
    date: request.date,
    requester: serializeRequester(state, request),
    title: request.title,
    message: request.message,
    positiveAnswersCount: answers.filter(({ answer }) => answer === 'positive').length,
  };
}

function serializeRequest(state: demo.State, request: demo.Request): Request {
  const answers = state.requestAnswers.filter(({ requestId }) => requestId === request.id);

  return {
    id: request.id,
    status: request.status,
    date: request.date,
    requester: serializeRequester(state, request),
    title: request.title,
    message: request.message,
    hasTransactions: state.transactions.some(({ requestId }) => requestId === request.id),
    answers: answers.map(({ id, memberId, answer }) => ({
      id,
      member: demo.serializeLightMember(demo.findMember(state, memberId)),
      answer,
    })),
  };
}
