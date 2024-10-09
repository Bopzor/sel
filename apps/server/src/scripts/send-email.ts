import { assert } from '@sel/utils';

import { container } from '../container';
import { TOKENS } from '../tokens';

// eslint-disable-next-line no-console
main(process.argv.slice(2)).catch(console.error);

async function main(argv: string[]) {
  const logger = container.resolve(TOKENS.logger);
  const emailAdapter = container.resolve(TOKENS.emailSender);
  const emailRenderer = container.resolve(TOKENS.emailRenderer);

  const [to, variable] = argv;

  try {
    assert(typeof to === 'string', 'missing <to>');
  } catch {
    logger.error(`usage: ${argv[0]} <to> <variable>`);
    process.exitCode = 1;
    return;
  }

  await emailAdapter.send({
    to,
    ...emailRenderer.render({
      subject: 'Test email',
      html: ['This is a test email.', `Variable: ${variable}`],
      text: ['This is a test email.', `Variable: ${variable}`],
    }),
  });
}
