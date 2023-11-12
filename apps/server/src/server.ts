import http from 'node:http';
import util from 'node:util';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Container, injectableClass } from 'ditox';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

import { ConfigPort } from './infrastructure/config/config.port';
import { LoggerPort } from './infrastructure/logger/logger.port';
import { AuthenticationError } from './session/session.provider';
import { InvalidSessionTokenError } from './session/session.service';
import { TOKENS } from './tokens';

export class Server {
  static inject = injectableClass(this, TOKENS.container, TOKENS.config, TOKENS.logger);

  private app = express();
  private server = http.createServer(this.app);

  constructor(
    private readonly container: Container,
    private readonly config: ConfigPort,
    private readonly logger: LoggerPort
  ) {
    this.app.use(cookieParser(config.session.secret));
    this.app.use(bodyParser.json());

    this.app.use(this.authenticationMiddleware);

    this.app.use('/health', this.healthCheck);
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

    this.logger.info(`server listening on ${host}:${port}`);
  }

  async close() {
    this.server.closeAllConnections();
    await util.promisify<void>((cb) => this.server.close(cb))();
    await this.container.resolve(TOKENS.database).close();

    this.logger.info('server closed');
  }

  private healthCheck: RequestHandler = (req, res) => {
    res.end();
  };

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
      const setCookie = [`token=`, `Max-Age=0`, 'HttpOnly', 'Path=/', 'SameSite=Lax'];
      res.status(401).header('Set-Cookie', setCookie.join(';')).json({ message: err.message });
    } else {
      next(err);
    }
  };

  private handleError: ErrorRequestHandler = (err, req, res, _next) => {
    this.logger.error(err);

    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  };
}
