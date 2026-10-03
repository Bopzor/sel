import type { HttpMethod } from 'src/app/api';

type Handler = (params: { url: URL; headers: Headers; body: unknown }) => Promise<Response>;

export abstract class FakeServer {
  readonly requests: URL[] = [];
  private endpoints: Record<string, Handler> = {};

  constructor() {
    this.init();
  }

  fetch = (input: string, init?: RequestInit): Promise<Response> => {
    const url = new URL(input, window.location.origin);
    const route = `${init?.method ?? 'GET'} ${url.pathname}`;

    this.requests.push(url);

    if (this.endpoints[route]) {
      return this.endpoints[route]({
        url,
        headers: new Headers(init?.headers),
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      });
    }

    throw new Error(`Unexpected request: ${route}`);
  };

  find(pathname: string) {
    return this.requests.filter((url) => url.pathname === pathname);
  }

  protected abstract init(): void;

  protected register(route: `${HttpMethod} /${string}`, handler: Handler) {
    this.endpoints[route] = handler;
  }

  protected json(body: unknown, init?: ResponseInit) {
    const headers = new Headers(init?.headers);

    headers.set('Content-Type', 'application/json');

    return Promise.resolve(new Response(JSON.stringify(body), { ...init, headers }));
  }

  protected noContent() {
    return Promise.resolve(new Response(null, { status: 204 }));
  }

  protected paginate<T>(items: T[], params: URLSearchParams) {
    const page = Number(params.get('page'));
    const pageSize = Number(params.get('pageSize'));

    return items.slice((page - 1) * pageSize, page * pageSize);
  }
}
