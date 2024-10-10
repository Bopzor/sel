import { Config } from '@sel/shared';
import { defined, pick } from '@sel/utils';
import cookieParser from 'cookie-parser';
import { eq } from 'drizzle-orm';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import morgan from 'morgan';
import { z } from 'zod';

import { container } from './infrastructure/container';
import { unsetCookie } from './infrastructure/cookie';
import { DomainError } from './infrastructure/domain-error';
import { HttpStatus, Unauthorized } from './infrastructure/http';
import { isAuthenticated, provideAuthenticatedMember } from './infrastructure/session';
import { TokenType } from './modules/authentication/authentication.entities';
import { router as authentication } from './modules/authentication/authentication.router';
import { router as session } from './modules/authentication/session.router';
import { router as events } from './modules/event/event.router';
import { router as information } from './modules/information/information.router';
import { router as interests } from './modules/interest/interest.router';
import { router as members } from './modules/member/member.router';
import { router as requests } from './modules/request/request.router';
import { router as transactions } from './modules/transaction/transaction.router';
import { db, schema } from './persistence';
import { TOKENS } from './tokens';

export function server() {
  const config = container.resolve(TOKENS.config);
  const app = express();

  app.use(morgan(import.meta.env.PROD ? 'short' : 'dev', {}));
  app.use(cookieParser(config.session.secret));
  app.use(express.json());
  app.use(authenticationProvider);

  app.use('/health', health);
  app.use('/config', isAuthenticated, configHandler);
  app.use('/authentication', authentication);
  app.use('/session', isAuthenticated, session);
  app.use('/events', isAuthenticated, events);
  app.use('/information', isAuthenticated, information);
  app.use('/interests', isAuthenticated, interests);
  app.use('/members', isAuthenticated, members);
  app.use('/requests', isAuthenticated, requests);
  app.use('/transactions', isAuthenticated, transactions);

  app.use(fallbackRequestHandler);

  app.use(zodErrorHandler);
  app.use(domainErrorHandler);
  app.use(fallbackErrorHandler);

  return app;
}

const authenticationProvider: RequestHandler = async (req, res, next) => {
  const tokenCookie: unknown = req.cookies['token'];

  if (typeof tokenCookie !== 'string') {
    return next();
  }

  const token = await db.query.tokens.findFirst({
    where: eq(schema.tokens.value, tokenCookie),
    with: { member: true },
  });

  if (!token || token.type !== TokenType.session) {
    res.setHeader('set-cookie', unsetCookie('token'));
    throw new Unauthorized('Invalid session token');
  }

  provideAuthenticatedMember(token.member, next);
};

const health: RequestHandler = (req, res) => {
  res.status(HttpStatus.noContent).end();
};

const configHandler: RequestHandler = async (req, res) => {
  const config = defined(await db.query.config.findFirst());

  res.json(pick(config, ['letsName', 'logoUrl', 'currency', 'currencyPlural']) satisfies Config);
  res.end();
};

const fallbackRequestHandler: RequestHandler = (req, res) => {
  res.status(HttpStatus.notFound).end();
};

const zodErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof z.ZodError) {
    res.status(HttpStatus.badRequest).json(err.format());
  } else {
    next(err);
  }
};

const domainErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof DomainError) {
    res.status(err.status ?? HttpStatus.internalServerError).json({ error: err.message, ...err.payload });
  } else {
    next(err);
  }
};

const fallbackErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const errorReporter = container.resolve(TOKENS.errorReporter);
  const logger = container.resolve(TOKENS.logger);

  void errorReporter.report(err);
  logger.error(err);

  if (typeof err.status === 'number') {
    res.status(err.status);
  } else {
    res.status(HttpStatus.internalServerError);
  }

  if (import.meta.env.PROD) {
    res.end();
  } else {
    res.json({ error: err.message });
  }
};