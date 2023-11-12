import { container } from './container.js';
import { TOKENS } from './tokens.js';

Error.stackTraceLimit = 1000;

main().catch(console.error);

async function main() {
  container.resolve(TOKENS.eventsLogger).init();
  container.resolve(TOKENS.eventsPersistor).init();
  await container.resolve(TOKENS.emailRenderer).init?.();

  await container.resolve(TOKENS.server).start();
}

process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);

function teardown() {
  container.resolve(TOKENS.server).close().catch(console.error);
}
