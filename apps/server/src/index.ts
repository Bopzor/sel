import { container } from './container.js';
import { initEventHandlers } from './init-event-handlers.js';
import { TOKENS } from './tokens.js';

Error.stackTraceLimit = 1000;

// eslint-disable-next-line no-console
main().catch(console.error);

async function main() {
  container.resolve(TOKENS.commandBus).init();
  container.resolve(TOKENS.eventsLogger).init();
  container.resolve(TOKENS.eventsPersistor).init();
  container.resolve(TOKENS.eventsSlackPublisher).init();
  container.resolve(TOKENS.notificationModule).init();
  await container.resolve(TOKENS.emailRenderer).init?.();

  initEventHandlers();

  await container.resolve(TOKENS.server).start();
}

process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);

function teardown() {
  // eslint-disable-next-line no-console
  container.resolve(TOKENS.server).close().catch(console.error);
}
