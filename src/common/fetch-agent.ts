import assert from 'assert';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';

import { Express } from 'express';
import { CookieJar } from 'tough-cookie';

export class FetchAgent {
  private server: Server;
  private baseUrl?: string;

  private headers: Record<string, string> = {};

  private currentUrl = 'http://localhost';
  private jar = new CookieJar();

  constructor(app: Express) {
    this.server = createServer(app);
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  getCookies() {
    return this.jar.getCookiesSync(this.currentUrl);
  }

  getCookie(name: string) {
    return this.getCookies().find((cookie) => cookie.key === name);
  }

  get(url: string, options: RequestInit = {}) {
    return this.fetch(url, { method: 'GET', ...options });
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

  protected async fetch(path: string, options: RequestInit) {
    if (!this.baseUrl) {
      await this.startServer();
    }

    assert(typeof this.baseUrl === 'string');

    const headers = new Headers(options.headers);

    options.headers = headers;

    const cookieString = await this.jar.getCookieString(this.currentUrl);

    if (cookieString) {
      headers.set('cookie', cookieString);
    }

    Object.entries(this.headers).forEach(([key, value]) => headers.set(key, value));

    const url = this.baseUrl + path;
    const response = await fetch(url, options);
    const setCookie = response.headers.get('set-cookie');

    if (setCookie) {
      await this.jar.setCookie(setCookie, this.currentUrl);
    }

    return response;
  }

  async startServer() {
    if (this.server.listening) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.server.listen(0, 'localhost', resolve);
    });

    const { address, port } = this.server.address() as AddressInfo;

    this.baseUrl = `http://${address}:${port}`;
  }

  async closeServer() {
    if (!this.server.listening) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
      });
    });
  }
}
