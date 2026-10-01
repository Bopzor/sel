import { z } from 'zod';

const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function api<Result>(
  method: HttpMethod,
  path: string,
  options: { query?: Record<string, string | number | undefined>; body?: unknown } = {},
): Promise<Result> {
  const init: RequestInit = { method, credentials: 'include' };

  if (options.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(baseUrl + path + searchParams(options.query), init);

  const body: unknown = response.headers.get('Content-Type')?.includes('application/json')
    ? await response.json()
    : undefined;

  if (!response.ok) {
    throw new ApiError(response, body);
  }

  return body as Result;
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
