import { assert } from '@sel/utils';

import { container } from '../container';
import { TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const [version, content] = args;
  const translation = container.resolve(TOKENS.translation);
  const subscriptionFacade = container.resolve(TOKENS.subscriptionFacade);

  assert(version, 'missing version');

  await subscriptionFacade.notify(
    'NewAppVersion',
    () => true,
    () => ({
      title: translation.translate('newAppVersion.title'),
      content: content ?? translation.translate('newAppVersion.content'),
      data: { version },
    })
  );
}
