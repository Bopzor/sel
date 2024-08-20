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
  const [memberId, name, link, content] = args;
  const notificationService = container.resolve(TOKENS.notificationService);

  assert(memberId, 'missing memberId');
  assert(name, 'missing name');
  assert(link, 'missing link');
  assert(content, 'missing content');

  await notificationService.notify([memberId], 'Test', {
    name,
    link,
    content,
  });
}
