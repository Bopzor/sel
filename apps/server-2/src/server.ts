import express, { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

import { container } from './infrastructure/container';
import { HttpStatus } from './infrastructure/http';
import { router as members } from './modules/member/member.router';
import { TOKENS } from './tokens';

export function server() {
  const app = express();

  app.use(express.json());

  app.use('/members', members);
  app.use(fallbackRequestHandler);

  app.use(zodErrorHandler);
  app.use(fallbackErrorHandler);

  return app;
}

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

const fallbackErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const logger = container.resolve(TOKENS.logger);

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
