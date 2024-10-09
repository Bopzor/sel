/// <reference types="vite/client" />

import 'dotenv/config';

import { container } from './infrastructure/container';
import { initialize } from './initialize';
import { server } from './server';
import { TOKENS } from './tokens';

const { host, port } = container.resolve(TOKENS.config).server;
const logger = container.resolve(TOKENS.logger);

initialize();

server().listen(port, host, () => {
  logger.log(`Server listening on ${host}:${port}`);
});
