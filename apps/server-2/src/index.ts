/// <reference types="vite/client" />

import 'dotenv/config';

import { container } from './infrastructure/container';
import { initialize } from './initialize';
import { server } from './server';
import { TOKENS } from './tokens';

process.on('uncaughtException', reportError);
process.on('unhandledRejection', reportError);

function reportError(error: unknown) {
  void errorReporter.report(error);
}

const errorReporter = container.resolve(TOKENS.errorReporter);
const { host, port } = container.resolve(TOKENS.config).server;
const logger = container.resolve(TOKENS.logger);

initialize();

server().listen(port, host, () => {
  logger.log(`Server listening on ${host}:${port}`);
});
