/// <reference types="vite/client" />

import 'dotenv/config';

import util from 'node:util';

import { container } from './infrastructure/container';
import { initialize } from './initialize';
import { db } from './persistence';
import { server } from './server';
import { TOKENS } from './tokens';

const { host, port } = container.resolve(TOKENS.config).server;
const errorReporter = container.resolve(TOKENS.errorReporter);
const events = container.resolve(TOKENS.events);
const logger = container.resolve(TOKENS.logger);

process.on('uncaughtException', reportError);
process.on('unhandledRejection', reportError);

process.on('SIGINT', (signal) => void closeServer(signal));
process.on('SIGTERM', (signal) => void closeServer(signal));

logger.log('Starting server');

initialize();

const httpServer = server().listen(port, host, () => {
  logger.log(`Server listening on ${host}:${port}`);
});

function reportError(error: unknown) {
  void errorReporter.report(error);
  logger.error(error);
}

async function closeServer(signal: NodeJS.Signals) {
  logger.log(`${signal} received, closing server`);

  try {
    await util.promisify(httpServer.close.bind(httpServer))();
    await events.waitForListeners();

    await db.$client.end();

    logger.log('Server closed');
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  }
}
