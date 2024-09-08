import { assert } from '@sel/utils';

import { Application } from '../application';
import { container } from '../container';
import { TOKENS } from '../tokens';

const app = container.resolve(TOKENS.application);
const logger = container.resolve(TOKENS.logger);

main(app, process.argv.slice(2))
  .catch((error) => logger.error(error))
  .finally(() => void app.close());

async function main(app: Application, args: string[]) {
  const notificationService = container.resolve(TOKENS.notificationService);
  const [version, content] = args;

  assert(version, 'missing version');

  await notificationService.notify(null, 'NewAppVersion', ({ firstName }) => ({
    member: { firstName },
    version,
    content,
  }));
}
