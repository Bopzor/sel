import { container } from './container.js';
import { TOKENS } from './tokens.js';

import './fake-data';

main();

process.on('SIGINT', teardown);
process.on('SIGTERM', teardown);

function main() {
  container.resolve(TOKENS.server).start().catch(console.error);
}

function teardown() {
  container.resolve(TOKENS.server).close().catch(console.error);
}
