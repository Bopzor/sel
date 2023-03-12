export interface HttpClient {
  get(url: string, options?: RequestInit): Promise<Response>;
  post(url: string, body?: unknown, options?: RequestInit): Promise<Response>;
  put(url: string, body?: unknown, options?: RequestInit): Promise<Response>;
}

export class FetchHttpClient implements HttpClient {
  baseUrl = '';

  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, options);
  }

  post(url: string, body?: unknown, options: RequestInit = {}) {
    return this.mutation('POST', url, body, options);
  }

  put(url: string, body?: unknown, options: RequestInit = {}) {
    return this.mutation('PUT', url, body, options);
  }

  protected mutation(method: string, url: string, body?: unknown, options: RequestInit = {}) {
    return this.fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : undefined),
        ...options.headers,
      },
    });
  }

  protected async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    return fetch(this.baseUrl + path, options);
  }
}

export class SSRFetchHttpClient extends FetchHttpClient {
  baseUrl = 'http://localhost:8000';

  constructor(private readonly cookie?: string) {
    super();
  }

  override async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    return super.fetch(path, {
      ...options,
      headers: {
        ...(this.cookie ? { cookie: this.cookie } : undefined),
        ...options.headers,
      },
    });
  }
}
