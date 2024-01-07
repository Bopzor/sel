import { container } from '../container';
import { TOKENS } from '../tokens';

main(process.argv.slice(2))
  // eslint-disable-next-line no-console
  .catch(console.error)
  .finally(() => void container.resolve(TOKENS.database).close());

async function main(args: string[]) {
  const translation = container.resolve(TOKENS.translation);
  const subscriptionFacade = container.resolve(TOKENS.subscriptionFacade);

  await subscriptionFacade.notify(
    'NewAppVersion',
    () => true,
    () => ({
      title: translation.translate('newAppVersion.title'),
      content: args[0] ?? translation.translate('newAppVersion.content'),
    })
  );
}
