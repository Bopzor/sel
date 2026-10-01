import type { HttpMethod } from './api';

type Handler = (params: { url: URL }) => Promise<Response>;

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
      return this.endpoints[route]({ url });
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

  protected json(status: number, body: unknown) {
    return Promise.resolve(
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
    );
  }

  protected noContent() {
    return Promise.resolve(new Response(null, { status: 204 }));
  }
}
