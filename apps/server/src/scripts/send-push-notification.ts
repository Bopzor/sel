import { assert } from '@sel/utils';

import { container } from '../container';
import { COMMANDS, TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const commandBus = container.resolve(TOKENS.commandBus);
  const pushNotification = container.resolve(TOKENS.pushNotification);

  const [memberId, title, content] = args;

  assert(memberId, 'missing memberId');
  assert(title, 'missing title');
  assert(content, 'missing content');

  pushNotification.init?.();
  await commandBus.executeCommand(COMMANDS.sendPushNotification, { memberId, title, content });
}
