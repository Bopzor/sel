import { container } from './container.js';
import { TOKENS } from './tokens.js';

Error.stackTraceLimit = 1000;

const logger = container.resolve(TOKENS.logger);
const onError = logger.error.bind(logger);

main().catch(onError);

async function main() {
  process.on('SIGINT', teardown);
  process.on('SIGTERM', teardown);

  await container.resolve(TOKENS.server).start();
}

function teardown() {
  container.resolve(TOKENS.server).close().catch(onError);
}
