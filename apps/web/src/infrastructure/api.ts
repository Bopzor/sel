import {
  addInterestMemberBodySchema,
  AuthenticatedMember,
  createCommentBodySchema,
  createEventBodySchema,
  createInformationBodySchema,
  createInterestBodySchema,
  createRequestBodySchema,
  createTransactionBodySchema,
  editInterestMemberBodySchema,
  Event,
  EventsListItem,
  Information,
  Interest,
  listTransactionsQuerySchema,
  notificationDeliveryBodySchema,
  Request,
  requestAuthenticationLinkQuerySchema,
  setEventParticipationBodySchema,
  setRequestAnswerBodySchema,
  Transaction,
  updateEventBodySchema,
  updateMemberProfileBodySchema,
  updateRequestBodySchema,
  verifyAuthenticationTokenQuerySchema,
} from '@sel/shared';
import { OmitNever } from '@sel/utils';
import { QueryKey, useQueryClient } from '@tanstack/solid-query';
import { injectableClass } from 'ditox';
import { z } from 'zod';

import { TOKENS } from '../tokens';

import { ConfigPort } from './config/config.port';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

type EndpointConfig = {
  path?: Record<string, string>;
  query?: z.ZodSchema;
  body?: z.ZodSchema;
};

type EndpointParam<Config extends EndpointConfig> = OmitNever<{
  path: Config['path'] extends Record<string, string> ? Config['path'] : never;
  query: Config['query'] extends z.ZodType ? z.infer<Config['query']> : never;
  body: Config['body'] extends z.ZodType ? z.infer<Config['body']> : never;
}>;

export class Api {
  static inject = injectableClass(this, TOKENS.config);

  constructor(private readonly config: ConfigPort) {}

  // authentication

  requestAuthenticationLink = this.endpoint<void, { query: typeof requestAuthenticationLinkQuerySchema }>(
    'post',
    '/authentication/request-authentication-link',
  );

  verifyAuthenticationToken = this.endpoint<void, { query: typeof verifyAuthenticationTokenQuerySchema }>(
    'get',
    '/authentication/verify-authentication-token',
  );

  getAuthenticatedMember = this.endpoint<AuthenticatedMember>('get', '/session/member');

  signOut = this.endpoint<void>('delete', '/session');

  // profile

  updateMemberProfile = this.endpoint<
    void,
    { path: { memberId: string }; body: typeof updateMemberProfileBodySchema }
  >('put', '/members/:memberId/profile');

  updateNotificationDelivery = this.endpoint<
    void,
    { path: { memberId: string }; body: typeof notificationDeliveryBodySchema }
  >('put', '/members/:memberId/notification-delivery');

  // information

  listInformation = this.endpoint<{ pin: Information[]; notPin: Information[] }>('get', '/information');

  createInformation = this.endpoint<string, { body: typeof createInformationBodySchema }>(
    'post',
    '/information',
  );

  // requests

  listRequests = this.endpoint<Request[]>('get', '/requests');

  getRequest = this.endpoint<Request, { path: { requestId: string } }>('get', '/requests/:requestId');

  createRequest = this.endpoint<string, { body: typeof createRequestBodySchema }>('post', '/requests');

  editRequest = this.endpoint<void, { path: { requestId: string }; body: typeof updateRequestBodySchema }>(
    'put',
    '/requests/:requestId',
  );

  cancelRequest = this.endpoint<void, { path: { requestId: string } }>('put', '/requests/:requestId/cancel');

  setRequestAnswer = this.endpoint<
    void,
    { path: { requestId: string }; body: typeof setRequestAnswerBodySchema }
  >('post', '/requests/:requestId/answer');

  createRequestComment = this.endpoint<
    string,
    { path: { requestId: string }; body: typeof createCommentBodySchema }
  >('post', '/requests/:requestId/comment');

  createRequestTransaction = this.endpoint<
    void,
    { path: { requestId: string }; body: typeof createTransactionBodySchema }
  >('post', '/requests/:requestId/transaction');

  // events

  listEvents = this.endpoint<EventsListItem[]>('get', '/events');

  getEvent = this.endpoint<Event, { path: { eventId: string } }>('get', '/events/:eventId');

  createEvent = this.endpoint<string, { body: typeof createEventBodySchema }>('post', '/events');

  updateEvent = this.endpoint<void, { path: { eventId: string }; body: typeof updateEventBodySchema }>(
    'put',
    '/events/:eventId',
  );

  setEventParticipation = this.endpoint<
    void,
    { path: { eventId: string }; body: typeof setEventParticipationBodySchema }
  >('put', '/events/:eventId/participation');

  createEventComment = this.endpoint<
    string,
    { path: { eventId: string }; body: typeof createCommentBodySchema }
  >('post', '/events/:eventId/comment');

  // interests

  listInterests = this.endpoint<Interest[]>('get', '/interests');

  createInterest = this.endpoint<string, { body: typeof createInterestBodySchema }>('post', '/interests');

  joinInterest = this.endpoint<
    void,
    { path: { interestId: string }; body: typeof addInterestMemberBodySchema }
  >('put', '/interests/:interestId/join');

  leaveInterest = this.endpoint<void, { path: { interestId: string } }>('put', '/interests/:interestId/join');

  editMemberInterestDescription = this.endpoint<
    void,
    { path: { interestId: string }; body: typeof editInterestMemberBodySchema }
  >('put', '/interests/:interestId/edit');

  // transactions

  listTransactions = this.endpoint<Transaction[], { query: typeof listTransactionsQuerySchema }>(
    'get',
    '/transactions',
  );

  createTransaction = this.endpoint<string, { body: typeof createTransactionBodySchema }>(
    'post',
    '/transactions',
  );

  acceptTransaction = this.endpoint<void, { path: { transactionId: string } }>(
    'put',
    '/transactions/:transactionId/accept',
  );

  cancelTransaction = this.endpoint<void, { path: { transactionId: string } }>(
    'put',
    '/transactions/:transactionId/cancel',
  );

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  private endpoint<Result, Config extends EndpointConfig = {}>(method: HttpMethod, path: string) {
    return async (config: EndpointParam<Config>): Promise<Result> => {
      const headers = new Headers();
      let body: string | undefined;

      if ('body' in config) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(config.body);
      }

      const response = await fetch(this.getUrl(path, config), { method, headers, body });

      if (!response.ok) {
        throw new ApiError(response, await this.getBody(response));
      }

      return this.getBody(response);
    };
  }

  private getUrl(path: string, config: EndpointParam<EndpointConfig>) {
    const base = new URL(this.config.api.url, window.location.origin);
    const url = new URL(path, base.origin);

    url.pathname = base.pathname + url.pathname;

    if ('path' in config) {
      for (const [key, value] of Object.entries(config.path as Record<string, string>)) {
        url.pathname = url.pathname.replaceAll(`:${key}`, value);
      }
    }

    if ('query' in config) {
      url.search = new URLSearchParams(config.query as Record<string, string>).toString();
    }

    return url.toString();
  }

  private getBody(response: Response) {
    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      return response.json();
    }

    return response.text();
  }
}

export function catchNotFound(error: unknown): null {
  if (ApiError.is(error) && error.status === 404) {
    return null;
  }

  throw error;
}

export function useInvalidateApi() {
  const queryClient = useQueryClient();

  return (...queryKeys: QueryKey[]) => {
    return Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  };
}

export class ApiError extends Error {
  private static errorSchema = z.object({
    error: z.string(),
    code: z.string().optional(),
  });

  public readonly body?: z.infer<typeof ApiError.errorSchema>;

  constructor(
    public readonly response: Response,
    body: unknown,
  ) {
    const { success, data } = ApiError.errorSchema.safeParse(body);
    super(success ? data.error : String(body));

    if (success) {
      this.body = data;
    }
  }

  static is(value: unknown): value is ApiError {
    return value instanceof this;
  }

  static isStatus(value: unknown, status: number): value is ApiError {
    return this.is(value) && value.status === status;
  }

  get status() {
    return this.response.status;
  }
}
