import { assert } from '@sel/utils';

import { container } from '../container';
import { COMMANDS, TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const [version, content] = args;
  const commandBus = container.resolve(TOKENS.commandBus);

  assert(version, 'missing version');

  await commandBus.executeCommand(COMMANDS.notify, {
    subscriptionType: 'NewAppVersion',
    notificationType: 'NewAppVersion',
    data: {
      version,
      content,
    },
  });
}
