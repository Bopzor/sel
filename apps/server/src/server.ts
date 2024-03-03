import http from 'node:http';
import util from 'node:util';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Container, injectableClass } from 'ditox';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

import { Application } from './application';
import { AuthenticationError, InvalidSessionTokenError } from './authentication/authentication.errors';
import { DomainError } from './domain-error';
import { HttpStatus } from './http-status';
import { ConfigPort } from './infrastructure/config/config.port';
import { ErrorReporterPort } from './infrastructure/error-reporter/error-reporter.port';
import { LoggerPort } from './infrastructure/logger/logger.port';
import { TOKENS } from './tokens';

export class Server {
  static inject = injectableClass(
    this,
    TOKENS.container,
    TOKENS.application,
    TOKENS.config,
    TOKENS.logger,
    TOKENS.errorReporter,
  );

  private app = express();
  private server = http.createServer(this.app);

  constructor(
    private readonly container: Container,
    private readonly application: Application,
    private readonly config: ConfigPort,
    private readonly logger: LoggerPort,
    private readonly errorReporter: ErrorReporterPort,
  ) {
    this.app.use(cookieParser(config.session.secret));
    this.app.use(bodyParser.json());

    this.app.use(this.authenticationMiddleware);

    this.app.use('/health', this.healthCheck);
    this.app.use('/members', container.resolve(TOKENS.membersController).router);
    this.app.use('/events', container.resolve(TOKENS.eventController).router);
    this.app.use('/requests', container.resolve(TOKENS.requestController).router);
    this.app.use('/authentication', container.resolve(TOKENS.authenticationController).router);
    this.app.use('/session', container.resolve(TOKENS.sessionController).router);
    this.app.use('/session/notifications', container.resolve(TOKENS.notificationController).router);

    this.app.use(this.handleZodError);
    this.app.use(this.handleAuthenticationError);
    this.app.use(this.handleDomainError);
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

    await this.application.close();

    this.logger.info('server closed');
  }

  private healthCheck: RequestHandler = (req, res) => {
    res.end();
  };

  private authenticationMiddleware: RequestHandler = async (req, res, next) => {
    const sessionProvider = this.container.resolve(TOKENS.sessionProvider);
    const token = req.cookies['token'];

    if (typeof token !== 'string') {
      return next();
    }

    await sessionProvider.provide(token, next);
  };

  private handleZodError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof z.ZodError) {
      res.status(HttpStatus.badRequest).json(err.format());
    } else {
      next(err);
    }
  };

  private handleAuthenticationError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof AuthenticationError) {
      res.status(HttpStatus.unauthorized).json({ message: err.message });
    } else if (err instanceof InvalidSessionTokenError) {
      const setCookie = [`token=`, `Max-Age=0`, 'HttpOnly', 'Path=/', 'SameSite=Lax'];

      res.header('Set-Cookie', setCookie.join(';'));
      res.status(HttpStatus.unauthorized).json({ message: err.message });
    } else {
      next(err);
    }
  };

  private handleDomainError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof DomainError) {
      res.status(err.status ?? HttpStatus.internalServerError);
      res.json({ message: err.message, stack: err.stack, details: err.payload });
    } else {
      next(err);
    }
  };

  private handleError: ErrorRequestHandler = (err, req, res, _next) => {
    this.logger.error(err);
    void this.errorReporter.report(err);

    res.status(HttpStatus.internalServerError);
    res.json({ error: err.message, stack: err.stack });
  };
}
