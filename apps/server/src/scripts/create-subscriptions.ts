import { assert } from '@sel/utils';

import { container } from '../container';
import { isSubscriptionType } from '../notifications/subscription.entity';
import { TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const [type, ...memberIds] = args;
  const subscriptionService = container.resolve(TOKENS.subscriptionService);

  assert(isSubscriptionType(type), 'Invalid subscription type');

  for (const memberId of memberIds) {
    await subscriptionService.createSubscription(type, memberId, undefined, false);
  }
}
