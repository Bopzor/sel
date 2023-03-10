import { Server } from 'node:http';
import { AddressInfo } from 'node:net';

import { Token } from 'brandi';
import express, { RequestHandler } from 'express';

import { container } from '../app/container';

import { CommandHandler } from './cqs/command-handler';
import { QueryHandler } from './cqs/query-handler';

export class ControllerTest {
  app = express();
  server?: Server;

  constructor(private middleware: RequestHandler) {}

  async init() {
    container.capture?.();

    this.app.use(express.json());
    this.app.use(this.middleware);

    await new Promise<void>((resolve) => {
      this.server = this.app.listen(resolve);
    });
  }

  async cleanup() {
    await new Promise<void>((resolve, reject) => {
      this.server?.close((err) => (err ? reject(err) : resolve()));
    });

    container.restore?.();
  }

  get baseUrl() {
    const addr = this.server?.address() as AddressInfo;

    return `http://localhost:${addr.port}`;
  }

  fetch(url: string, opts?: RequestInit) {
    return fetch(this.baseUrl + url, opts);
  }

  overrideCommandHandler(token: Token<CommandHandler<unknown>>, handle: () => void) {
    container.bind(token).toConstant({
      handle: handle as () => Promise<void>,
    });
  }

  overrideQueryHandler<Result>(token: Token<QueryHandler<unknown, Result>>, handle: () => Result) {
    container.bind(token).toConstant({
      handle: handle as () => Promise<Result>,
    });
  }
}
