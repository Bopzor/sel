import { assert } from '@sel/utils';

import { Application } from '../application';
import { container } from '../container';
import { isSubscriptionType } from '../notifications/subscription.entity';
import { TOKENS } from '../tokens';

const app = container.resolve(TOKENS.application);
const logger = container.resolve(TOKENS.logger);

main(app, process.argv.slice(2))
  .catch((error) => logger.error(error))
  .finally(() => void app.close());

async function main(app: Application, args: string[]) {
  const [type, ...memberIds] = args;

  assert(isSubscriptionType(type), 'Invalid subscription type');

  for (const memberId of memberIds) {
    await app.createSubscription({
      type,
      memberId,
      active: false,
    });
  }
}
