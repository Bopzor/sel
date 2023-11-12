import { container } from './container.js';
import { EmitterEventsAdapter } from './infrastructure/events/emitter-events.adapter.js';
import { TOKENS } from './tokens.js';

Error.stackTraceLimit = 1000;

main().catch(console.error);

async function main() {
  const events = container.resolve(TOKENS.events);
  const logger = container.resolve(TOKENS.logger);
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const authenticationModule = container.resolve(TOKENS.authenticationModule);
  const server = container.resolve(TOKENS.server);

  if (events instanceof EmitterEventsAdapter) {
    events.addEventListener((event) => logger.info(event));
  }

  await emailRenderer.init?.();
  authenticationModule.init();

  await server.start();
}

process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);

function teardown() {
  container.resolve(TOKENS.server).close().catch(console.error);
}
