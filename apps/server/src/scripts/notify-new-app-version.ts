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
  const subscriptionService = container.resolve(TOKENS.subscriptionService);
  const emailRenderer = container.resolve(TOKENS.emailRenderer);
  const translation = container.resolve(TOKENS.translation);
  const config = container.resolve(TOKENS.config);
  const [version, content] = args;

  assert(version, 'missing version');

  const appBaseUrl = config.app.baseUrl;

  await subscriptionService.notify({
    subscriptionType: 'NewAppVersion',
    notificationType: 'NewAppVersion',
    data: () => ({
      shouldSend: true,
      title: translation.translate('newAppVersion.title'),
      push: {
        title: translation.translate('newAppVersion.push.title'),
        content: content ?? translation.translate('newAppVersion.push.content'),
        link: appBaseUrl,
      },
      email: emailRenderer.render({
        subject: translation.translate('newAppVersion.email.subject'),
        html: [
          translation.translate('newAppVersion.email.line1'),
          translation.translate('newAppVersion.email.line2', { appBaseUrl }),
        ],
        text: [
          translation.translate('newAppVersion.email.line1'),
          translation.translate('newAppVersion.email.line2', { appBaseUrl }),
        ],
      }),
    }),
  });
}
