export class FetchResult<Body> {
  constructor(public readonly response: Response, public readonly body: Body) {}

  static is(value: unknown): value is FetchResult<unknown> {
    return value instanceof FetchResult;
  }

  get status() {
    return this.response.status;
  }
}

export class Fetcher {
  async get<ResponseBody>(path: string) {
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

  private async fetch<Body>(path: string, init: RequestInit): Promise<FetchResult<Body>> {
    const response = await fetch(path, init);
    const body: Body = await this.getBody(response);

    const result = new FetchResult(response, body);

    if (!response.ok) {
      throw result;
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
