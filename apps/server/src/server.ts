import http from 'node:http';
import util from 'node:util';

import { Container, injectableClass } from 'ditox';
import express from 'express';

import { ConfigPort } from './infrastructure/config/config.port';
import { TOKENS } from './tokens';

export class Server {
  static inject = injectableClass(this, TOKENS.container, TOKENS.config);

  private app = express();
  private server = http.createServer(this.app);

  constructor(container: Container, private config: ConfigPort) {
    this.app.use('/requests', container.resolve(TOKENS.requestsController).router);
    this.app.use('/members', container.resolve(TOKENS.membersController).router);
  }

  async start() {
    const host = this.config.server.host;
    const port = this.config.server.port;

    await new Promise<void>((resolve, reject) => {
      this.server.once('error', reject);

      this.server.listen(port, host, () => {
        this.server.off('error', reject);
        resolve();
      });
    });

    console.log(`server listening on ${host}:${port}`);
  }

  async close() {
    this.server.closeAllConnections();
    await util.promisify<void>((cb) => this.server.close(cb))();

    console.log('server closed');
  }
}
