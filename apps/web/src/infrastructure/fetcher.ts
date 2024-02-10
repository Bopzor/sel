import { assert } from '@sel/utils';
import { z } from 'zod';

export class FetchResult<Body> {
  constructor(
    public readonly response: Response,
    public readonly body: Body,
  ) {}

  get status() {
    return this.response.status;
  }

  get headers() {
    return this.response.headers;
  }
}

export class FetchError extends Error {
  constructor(
    public readonly path: string,
    public readonly request: RequestInit,
    public readonly result: FetchResult<unknown>,
  ) {
    super(`${request.method} ${path}: ${result.status} ${result.response.statusText}`);
  }

  static is(value: unknown, status?: number): value is FetchError {
    if (!(value instanceof this)) {
      return false;
    }

    if (status !== undefined && status !== value.result.status) {
      return false;
    }

    return true;
  }

  get response() {
    return this.result.response;
  }

  get status() {
    return this.result.status;
  }

  private static bodySchema = z.object({
    code: z.string(),
    message: z.string(),
  });

  get body() {
    return FetchError.bodySchema.parse(this.result.body);
  }
}

type FetchPromise<T> = Promise<FetchResult<T>> & {
  body: () => Promise<T>;
};

export interface FetcherPort {
  get<ResponseBody>(path: string): FetchPromise<ResponseBody>;
  post<RequestBody, ResponseBody>(path: string, body?: RequestBody): FetchPromise<ResponseBody>;
  put<RequestBody, ResponseBody>(path: string, body?: RequestBody): FetchPromise<ResponseBody>;
  patch<RequestBody, ResponseBody>(path: string, body?: RequestBody): FetchPromise<ResponseBody>;
  delete<RequestBody, ResponseBody>(path: string, body?: RequestBody): FetchPromise<ResponseBody>;
}

export class StubFetcher implements FetcherPort {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requests = new Map<string, any>();

  private execute = <T>(path: string): FetchPromise<T> => {
    assert(this.requests.has(path), `StubFetcher: no request for path "${path}"`);

    const result = this.requests.get(path);
    const promise = Promise.resolve(result) as FetchPromise<T>;

    promise.body = () => Promise.resolve(result.body);

    return promise;
  };

  get = this.execute;
  post = this.execute;
  put = this.execute;
  patch = this.execute;
  delete = this.execute;
}

export class Fetcher implements FetcherPort {
  get<ResponseBody>(path: string) {
    return this.fetch<ResponseBody>(path, { method: 'GET' });
  }

  post = this.mutate('POST');
  put = this.mutate('PUT');
  patch = this.mutate('PATCH');
  delete = this.mutate('DELETE');

  private mutate(method: string) {
    return <RequestBody, ResponseBody>(path: string, body?: RequestBody) => {
      const headers = new Headers();

      if (body !== undefined) {
        headers.set('Content-Type', 'application/json');
      }

      return this.fetch<ResponseBody>(path, {
        method,
        headers,
        body: JSON.stringify(body),
      });
    };
  }

  private fetch<Body>(path: string, init: RequestInit): FetchPromise<Body> {
    const promise = new Promise((resolve, reject) => {
      this.execute<Body>(path, init).then(resolve, reject);
    }) as FetchPromise<Body>;

    promise.body = async () => {
      return (await promise).body;
    };

    return promise;
  }

  private async execute<Body>(path: string, init: RequestInit): Promise<FetchResult<Body>> {
    // await new Promise((r) => setTimeout(r, 1000));
    const response = await fetch(path, init);
    const body: Body = await this.getBody(response);

    const result = new FetchResult(response, body);

    if (!response.ok) {
      throw new FetchError(path, init, result);
    }

    return result;
  }

  private getBody(response: Response) {
    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      return response.json();
    }

    return response.text();
  }
}
