import path from 'node:path';
import url from 'node:url';

import { MikroORM, RequestContext } from '@mikro-orm/core';
import compression from 'compression';
import express, { ErrorRequestHandler, Router, type RequestHandler } from 'express';
import { QueryClient } from 'react-query';
import * as vite from 'vite';
import { renderPage } from 'vite-plugin-ssr';

import './api/env';

import { container } from './api/container';
import mikroOrmConfig from './api/persistence/mikro-orm.config';
import { sessionMiddleware } from './api/session-middleware';
import { TOKENS } from './api/tokens';
import { yup } from './common/yup';
import { router as authRouter } from './modules/authentication/authentication.controller';
import { router as membersRouter } from './modules/members/api/members.api';
import { router as requestsRouter } from './modules/requests/api/requests.api';

Error.stackTraceLimit = Infinity;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const prod = process.env.NODE_ENV === 'production';
const host = process.env.HOST as string;
const port = process.env.PORT as string;

const root = path.resolve(__dirname, '..');

const api = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  const router = Router();

  router.use(express.json());

  container.bind(TOKENS.orm).toConstant(orm);

  router.use((req, res, next) => {
    RequestContext.create(orm.em, next);
  });

  router.use('/auth', authRouter);
  router.use('/members', membersRouter);
  router.use('/requests', requestsRouter);

  router.use(apiEndpointNotFoundHandler);

  router.use(validationErrorHandler);
  router.use(fallbackErrorHandler);

  return router;
};

void startServer();

async function startServer() {
  const app = express();

  app.use(compression());
  app.use(sessionMiddleware);

  if (prod) {
    app.use(express.static(path.join(root, 'dist', 'client')));
  } else {
    const viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: true },
      build: {
        sourcemap: true,
      },
    });

    app.use(viteDevServer.middlewares);
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const handleRequest: RequestHandler = async (req, res, next) => {
    const queryClient = new QueryClient();

    const { httpResponse } = await renderPage({
      urlOriginal: req.originalUrl,
      cookie: req.headers.cookie,
      queryClient,
    });

    if (!httpResponse) {
      return next();
    }

    const { body, statusCode, contentType, earlyHints } = httpResponse;

    res.writeEarlyHints?.({
      link: earlyHints.map((e) => e.earlyHintLink),
    });

    res.status(statusCode).type(contentType).send(body);
  };

  app.use('/api', await api());
  app.get(/.*/, handleRequest);

  app.listen(Number(port), host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

const apiEndpointNotFoundHandler: RequestHandler = (req, res, _next) => {
  res.status(404).end();
};

const validationErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof yup.ValidationError) {
    res.status(400).json(err);
  } else {
    next(err);
  }
};

const fallbackErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(err);
  res.status(500).send(err.message);
};
