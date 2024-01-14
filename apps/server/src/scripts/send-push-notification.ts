import { assert } from '@sel/utils';

import { container } from '../container';
import { TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const pushNotificationService = container.resolve(TOKENS.pushNotificationService);

  const [memberId, title, content] = args;

  assert(memberId, 'missing memberId');
  assert(title, 'missing title');
  assert(content, 'missing content');

  await pushNotificationService.sendPushNotification(memberId, title, content);
}
