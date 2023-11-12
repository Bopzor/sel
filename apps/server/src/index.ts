import { container } from './container.js';
import { TOKENS } from './tokens.js';

Error.stackTraceLimit = 1000;

main().catch(console.error);

async function main() {
  const server = container.resolve(TOKENS.server);
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const authenticationModule = container.resolve(TOKENS.authenticationModule);

  await emailRenderer.init?.();
  authenticationModule.init();

  await server.start();
}

process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);

function teardown() {
  container.resolve(TOKENS.server).close().catch(console.error);
}
