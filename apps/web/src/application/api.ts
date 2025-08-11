import * as shared from '@sel/shared';
import { OmitNever, wait } from '@sel/utils';
import { z } from 'zod';

const delay = 0;

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

type EndpointConfig = Partial<{
  path: Record<string, string>;
  query: z.ZodSchema;
  body: z.ZodSchema;
  files: Record<string, File>;
}>;

type EndpointParam<Config extends EndpointConfig> = OmitNever<{
  path: Config['path'] extends Record<string, string> ? Config['path'] : never;
  query: Config['query'] extends z.ZodType ? z.infer<Config['query']> : never;
  body: Config['body'] extends z.ZodType ? z.infer<Config['body']> : never;
}>;

export const api = {
  // config

  getConfig: endpoint('get', '/config').types<{
    result: shared.Config;
  }>(),

  // authentication

  requestAuthenticationLink: endpoint('post', '/authentication/request-authentication-link').types<{
    query: typeof shared.requestAuthenticationLinkQuerySchema;
  }>(),

  verifyAuthenticationToken: endpoint('get', '/authentication/verify-authentication-token').types<{
    query: typeof shared.verifyAuthenticationTokenQuerySchema;
  }>(),

  getAuthenticatedMember: endpoint('get', '/session/member').types<{
    result: shared.AuthenticatedMember;
  }>(),

  signOut: endpoint('delete', '/session').types<Record<string, never>>(),

  // members

  listMembers: endpoint('get', '/members').types<{
    query: typeof shared.listMembersQuerySchema;
    result: shared.Member[];
  }>(),

  listMembersAdmin: endpoint('get', '/admin/members').types<{
    result: shared.AdminMember[];
  }>(),

  getMember: endpoint('get', '/members/:memberId').types<{
    path: { memberId: string };
    result: shared.Member;
  }>(),

  listMemberTransactions: endpoint('get', '/members/:memberId/transactions').types<{
    path: { memberId: string };
    result: shared.Transaction[];
  }>(),

  // profile

  updateMemberProfile: endpoint('put', '/members/:memberId/profile').types<{
    path: { memberId: string };
    body: typeof shared.updateMemberProfileBodySchema;
  }>(),

  updateNotificationDelivery: endpoint('put', '/members/:memberId/notification-delivery').types<{
    path: { memberId: string };
    body: typeof shared.notificationDeliveryBodySchema;
  }>(),

  registerDevice: endpoint('post', '/session/notifications/register-device').types<{
    body: typeof shared.registerDeviceBodySchema;
  }>(),

  // files

  uploadFile: endpoint('post', '/files/upload').types<{
    files: { file: File };
    result: shared.File;
  }>(),

  // comment

  getComments: endpoint('get', '/comment').types<{
    query: typeof shared.getCommentsQuerySchema;
    result: shared.Comment[];
  }>(),

  createComment: endpoint('post', '/comment').types<{
    body: typeof shared.createCommentBodySchema;
    result: string;
  }>(),

  // feed

  getFeed: endpoint('get', '/feed').types<{
    result: shared.Feed;
  }>(),

  // information

  listInformation: endpoint('get', '/information').types<{
    result: shared.Information[];
  }>(),

  getInformation: endpoint('get', '/information/:informationId').types<{
    path: { informationId: string };
    result: shared.Information;
  }>(),

  createInformation: endpoint('post', '/information').types<{
    body: typeof shared.createInformationBodySchema;
    result: string;
  }>(),

  // requests

  listRequests: endpoint('get', '/requests').types<{
    result: shared.Request[];
  }>(),

  getRequest: endpoint('get', '/requests/:requestId').types<{
    path: { requestId: string };
    result: shared.Request;
  }>(),

  createRequest: endpoint('post', '/requests').types<{
    body: typeof shared.createRequestBodySchema;
    result: string;
  }>(),

  updateRequest: endpoint('put', '/requests/:requestId').types<{
    path: { requestId: string };
    body: typeof shared.updateRequestBodySchema;
  }>(),

  cancelRequest: endpoint('put', '/requests/:requestId/cancel').types<{
    path: { requestId: string };
  }>(),

  fulfilRequest: endpoint('put', '/requests/:requestId/fulfil').types<{
    path: { requestId: string };
  }>(),

  setRequestAnswer: endpoint('post', '/requests/:requestId/answer').types<{
    path: { requestId: string };
    body: typeof shared.setRequestAnswerBodySchema;
  }>(),

  createRequestTransaction: endpoint('post', '/requests/:requestId/transaction').types<{
    path: { requestId: string };
    body: typeof shared.createTransactionBodySchema;
  }>(),

  // events

  listEvents: endpoint('get', '/events').types<{
    result: shared.EventsListItem[];
  }>(),

  getEvent: endpoint('get', '/events/:eventId').types<{
    result: shared.Event;
    path: { eventId: string };
  }>(),

  createEvent: endpoint('post', '/events').types<{
    body: typeof shared.createEventBodySchema;
    result: string;
  }>(),

  updateEvent: endpoint('put', '/events/:eventId').types<{
    path: { eventId: string };
    body: typeof shared.updateEventBodySchema;
  }>(),

  setEventParticipation: endpoint('put', '/events/:eventId/participation').types<{
    path: { eventId: string };
    body: typeof shared.setEventParticipationBodySchema;
  }>(),

  // interests

  listInterests: endpoint('get', '/interests').types<{
    result: shared.Interest[];
  }>(),

  createInterest: endpoint('post', '/interests').types<{
    body: typeof shared.createInterestBodySchema;
    result: string;
  }>(),

  joinInterest: endpoint('put', '/interests/:interestId/join').types<{
    path: { interestId: string };
    body: typeof shared.addInterestMemberBodySchema;
  }>(),

  leaveInterest: endpoint('put', '/interests/:interestId/leave').types<{
    path: { interestId: string };
  }>(),

  editMemberInterestDescription: endpoint('put', '/interests/:interestId/edit').types<{
    path: { interestId: string };
    body: typeof shared.editInterestMemberBodySchema;
  }>(),

  // transactions

  listTransactions: endpoint('get', '/transactions').types<{
    query: typeof shared.listTransactionsQuerySchema;
    result: shared.Transaction[];
  }>(),

  createTransaction: endpoint('post', '/transactions').types<{
    body: typeof shared.createTransactionBodySchema;
    result: string;
  }>(),

  acceptTransaction: endpoint('put', '/transactions/:transactionId/accept').types<{
    path: { transactionId: string };
  }>(),

  cancelTransaction: endpoint('put', '/transactions/:transactionId/cancel').types<{
    path: { transactionId: string };
  }>(),
};

function endpoint(method: HttpMethod, path: string) {
  type Endpoint<Config extends EndpointConfig, Result> = (param: EndpointParam<Config>) => Promise<Result>;

  const endpoint: Endpoint<EndpointConfig, unknown> = async (param) => {
    const headers = new Headers();
    const init: RequestInit = { method, headers };

    if ('body' in param) {
      headers.set('Content-Type', 'application/json');
      init.body = JSON.stringify(param.body);
    }

    if ('files' in param) {
      init.body = new FormData();

      for (const [name, file] of Object.entries(param.files as Record<string, File>)) {
        init.body.append(name, file);
      }
    }

    if (delay) {
      await wait(delay);
    }

    const response = await fetch(getUrl(path, param), init);

    if (!response.ok) {
      throw new ApiError(response, await getBody(response));
    }

    return getBody(response);
  };

  function types<Config extends EndpointConfig & { result: unknown }>(): Endpoint<Config, Config['result']>;
  function types<Config extends EndpointConfig>(): Endpoint<Config, void>;

  function types(): Endpoint<EndpointConfig, unknown> {
    return endpoint;
  }

  return { types };

  function getUrl(pathname: string, config: EndpointParam<EndpointConfig>) {
    const { path, query } = { path: {}, query: {}, ...config };

    const base = new URL('/api', window.location.origin);
    const url = new URL(pathname, base.origin);

    url.pathname = base.pathname + url.pathname;

    for (const [key, value] of Object.entries(path)) {
      url.pathname = url.pathname.replaceAll(`:${key}`, value as string);
    }

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) {
        delete query[key as keyof typeof query];
      }
    }

    url.search = new URLSearchParams(query).toString();

    return url.toString();
  }

  function getBody(response: Response) {
    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      return response.json();
    }

    return response.text();
  }
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

declare global {
  interface Window {
    api: typeof api;
  }
}

if (typeof window !== 'undefined') {
  window.api = api;
}
