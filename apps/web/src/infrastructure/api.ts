import {
  createCommentBodySchema,
  createEventBodySchema,
  Event,
  EventsListItem,
  setEventParticipationBodySchema,
  updateEventBodySchema,
} from '@sel/shared';
import { OmitNever } from '@sel/utils';
import { injectableClass } from 'ditox';
import { z } from 'zod';

import { TOKENS } from '../tokens';

import { ConfigPort } from './config/config.port';

type HttpMethod = 'get' | 'post' | 'put';

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

  listEvents = this.endpoint<EventsListItem[]>('get', '/events');

  getEvent = this.endpoint<Event, { path: { eventId: string } }>('get', '/events/:eventId');

  createEvent = this.endpoint<string, { body: typeof createEventBodySchema }>('post', '/events');

  updateEvent = this.endpoint<
    void,
    {
      path: { eventId: string };
      body: typeof updateEventBodySchema;
    }
  >('put', '/events/:eventId');

  setParticipation = this.endpoint<
    void,
    { path: { eventId: string }; body: typeof setEventParticipationBodySchema }
  >('put', '/events/:eventId/participation');

  createEventComment = this.endpoint<
    string,
    { path: { eventId: string }; body: typeof createCommentBodySchema }
  >('post', '/events/:eventId/comment');

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

class ApiError extends Error {
  private static errorSchema = z.object({
    error: z.string(),
  });

  constructor(
    public readonly response: Response,
    public readonly body: unknown,
  ) {
    const { success, data } = ApiError.errorSchema.safeParse(body);
    super(success ? data.error : String(body));
  }

  static is(value: unknown): value is ApiError {
    return value instanceof this;
  }

  get status() {
    return this.response.status;
  }
}
