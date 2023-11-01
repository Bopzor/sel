import http from 'node:http';
import util from 'node:util';

import cookieParser from 'cookie-parser';
import { Container, injectableClass } from 'ditox';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

import { ConfigPort } from './infrastructure/config/config.port';
import { AuthenticationError } from './session/session.provider';
import { InvalidSessionTokenError } from './session/session.service';
import { TOKENS } from './tokens';

export class Server {
  static inject = injectableClass(this, TOKENS.container, TOKENS.config);

  private app = express();
  private server = http.createServer(this.app);

  constructor(private container: Container, private config: ConfigPort) {
    // todo: secret
    this.app.use(cookieParser());

    this.app.use(this.authenticationMiddleware);

    this.app.use('/requests', container.resolve(TOKENS.requestsController).router);
    this.app.use('/members', container.resolve(TOKENS.membersController).router);
    this.app.use('/authentication', container.resolve(TOKENS.authenticationController).router);
    this.app.use('/session', container.resolve(TOKENS.sessionController).router);

    this.app.use(this.handleZodError);
    this.app.use(this.handleAuthenticationError);
    this.app.use(this.handleError);
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

  private authenticationMiddleware: RequestHandler = async (req, res, next) => {
    const sessionService = this.container.resolve(TOKENS.sessionService);
    const sessionProvider = this.container.resolve(TOKENS.sessionProvider);

    const token = req.cookies['token'];

    if (typeof token !== 'string') {
      return next();
    }

    const member = await sessionService.getSessionMember(token);

    sessionProvider.provide(member, next);
  };

  private handleZodError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof z.ZodError) {
      res.status(400).json(err.format());
    } else {
      next(err);
    }
  };

  private handleAuthenticationError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof AuthenticationError) {
      res.status(401).json({ message: err.message });
    } else if (err instanceof InvalidSessionTokenError) {
      res.status(401).json({ message: err.message });
    } else {
      next(err);
    }
  };

  private handleError: ErrorRequestHandler = (err, req, res, _next) => {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  };
}
