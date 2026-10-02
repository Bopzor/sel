import { assert } from '@sel/utils';
import { z } from 'zod';

const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type FailApi = boolean | number;

type ApiOptions = {
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  paginated?: boolean;
  fail?: FailApi;
};

export async function api<Result>(
  method: HttpMethod,
  path: string,
  options: ApiOptions = {},
): Promise<Result> {
  const init: RequestInit = { method, credentials: 'include' };

  if (options.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }

  const fail = options.fail ?? globalThis._failApi;

  if (import.meta.env.DEV && fail) {
    throw new FakeApiError(fail);
  }

  const response = await fetch(baseUrl + path + searchParams(options.query), init);

  const body: unknown = response.headers.get('Content-Type')?.includes('application/json')
    ? await response.json()
    : undefined;

  if (!response.ok) {
    throw new ApiError(response, body);
  }

  if (options.paginated) {
    assert(response.headers.has('X-Pagination-Total'), `Missing pagination header on ${method} ${path}`);

    return {
      total: Number(response.headers.get('X-Pagination-Total')),
      items: body,
    } as Result;
  }

  return body as Result;
}

export function fileUrl(name: string) {
  return `${baseUrl}/files/${name}`;
}

function searchParams(query: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const search = params.toString();

  return search === '' ? '' : `?${search}`;
}

export class ApiError extends Error {
  private static errorBodySchema = z.object({
    error: z.string(),
    code: z.string().optional(),
  });

  readonly status: number;
  readonly code: string | undefined;
  readonly body: unknown;

  constructor(response: Response, body: unknown) {
    const { success, data } = ApiError.errorBodySchema.safeParse(body);

    if (success) {
      super(data.error);
    } else {
      super(`HTTP ${String(response.status)} (${response.statusText})`);
    }

    this.status = response.status;
    this.code = data?.code;
    this.body = body;
  }

  static is(value: unknown, status?: number): value is ApiError {
    return value instanceof ApiError && (status === undefined || value.status === status);
  }
}

declare global {
  // Set from the browser's console, to see how the app handles a failing request.
  var _failApi: FailApi | undefined;
}

class FakeApiError extends ApiError {
  constructor(status: boolean | number) {
    const body = {
      status: typeof status === 'number' ? status : 500,
      code: 'error',
      message: 'Fake Error',
    };

    const response = new Response(JSON.stringify(body), {
      status: body.status,
      headers: { 'Content-Type': 'application/json' },
    });

    super(response, body);
  }
}
