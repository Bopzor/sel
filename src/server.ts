import path from 'node:path';
import url from 'node:url';

import compression from 'compression';
import express, { type RequestHandler } from 'express';
import { renderPage } from 'vite-plugin-ssr';

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

  const handleRequest: AsyncRequestHandler = async (req, res, next) => {
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

  app.get('*', asyncRequestHandler(handleRequest));

  app.listen(Number(port), host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

type AsyncRequestHandler = (...params: Parameters<RequestHandler>) => Promise<void>;

function asyncRequestHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
