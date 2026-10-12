import type { Document, File as UploadedFile } from '@sel/shared';
import { assert, wait } from '@sel/utils';
import { z } from 'zod';

const baseUrl = '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type FailApi = boolean | number;

declare global {
  // Set from the browser's console, to see how the app handles a failing request.
  var failApi: FailApi | undefined;
  var delayApi: number | undefined;
}

type ApiOptions = {
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  paginated?: boolean;
  fail?: FailApi;
  delay?: number;
};

export async function api<Result>(
  method: HttpMethod,
  path: string,
  options: ApiOptions = {},
): Promise<Result> {
  const init: RequestInit = { method, credentials: 'include' };

  // The browser sets the multipart Content-Type, with its boundary.
  if (options.body instanceof FormData) {
    init.body = options.body;
  } else if (options.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }

  if (import.meta.env.DEV) {
    await devtools(options);
  }

  const response = await fetch(baseUrl + path + searchParams(options.query), init).catch((cause: unknown) => {
    throw new NetworkError(cause);
  });

  const body: unknown = await parseBody(response);

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

export function documentUrl(document: Document) {
  return baseUrl + document.url;
}

export const maxFileSize = 10 * 1024 * 1024;

export function uploadFile(file: File) {
  const body = new FormData();

  body.set('file', file);

  return api<UploadedFile>('POST', '/files/upload', { body });
}

async function devtools(options: ApiOptions) {
  const delay = options.delay ?? globalThis.delayApi;

  if (delay !== undefined) {
    await wait(delay);
  }

  const fail = options.fail ?? globalThis.failApi;

  if (fail) {
    throw new FakeApiError(fail);
  }
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

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type');

  if (contentType?.startsWith('application/json')) {
    return response.json();
  }

  if (contentType?.startsWith('text/')) {
    return response.text();
  }

  return undefined;
}

export class ApiError extends Error {
  private static errorBodySchema = z.object({
    error: z.string(),
    code: z.string().optional(),
    issues: z.array(z.custom<z.core.$ZodIssue>()).optional(),
  });

  readonly status: number;
  readonly code?: string;
  readonly issues?: z.core.$ZodIssue[];
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
    this.issues = data?.issues;
    this.body = body;
  }

  static is(value: unknown, status?: number): value is ApiError {
    return value instanceof ApiError && (status === undefined || value.status === status);
  }
}

// fetch rejects only when no response was received: the server could not be reached.
export class NetworkError extends Error {
  override readonly name = 'NetworkError';

  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
  }

  static is(value: unknown): value is NetworkError {
    return value instanceof NetworkError;
  }
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
      statusText: 'Fake',
      headers: { 'Content-Type': 'application/json' },
    });

    super(response, body);
  }
}
