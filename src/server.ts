import path from 'node:path';
import url from 'node:url';

import compression from 'compression';
import express, { Router, type RequestHandler } from 'express';
import { renderPage } from 'vite-plugin-ssr';

import { router as membersRouter } from './modules/members/api/members.api';
import { router as requestsRouter } from './modules/requests/api/requests.api';

import './renderer/initial-data';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const prod = process.env.NODE_ENV === 'production';
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? 8000;
const root = path.resolve(__dirname, '..');

void startServer();

async function startServer() {
  const app = express();

  app.use(compression());

  if (prod) {
    app.use(express.static(path.join(root, 'dist', 'client')));
  } else {
    const vite = await import('vite');
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
    const { httpResponse } = await renderPage({
      urlOriginal: req.originalUrl,
      headers: req.headers,
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

  app.use('/api', api());
  app.get('*', handleRequest);

  app.listen(Number(port), host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

const api = () => {
  const router = Router();

  router.use('/members', membersRouter);
  router.use('/requests', requestsRouter);

  router.use((req, res) => {
    res.status(404).end();
  });

  return router;
};
