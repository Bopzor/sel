import { assert } from '@sel/utils';

import { container } from '../container';
import { isSubscriptionType } from '../notifications/subscription.repository';
import { TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const [type, ...memberIds] = args;
  const subscriptionFacade = container.resolve(TOKENS.subscriptionFacade);

  assert(isSubscriptionType(type), 'Invalid subscription type');

  for (const memberId of memberIds) {
    await subscriptionFacade.createSubscription(type, memberId, false);
  }
}
