import { assert } from '@sel/utils';

import { container } from '../container';
import { TOKENS } from '../tokens';

// eslint-disable-next-line no-console
main(process.argv).catch(console.error);

async function main(argv: string[]) {
  const logger = container.resolve(TOKENS.logger);
  const emailAdapter = container.resolve(TOKENS.emailSender);

  const [to, variable] = argv;

  try {
    assert(typeof to === 'string', 'missing <to>');
  } catch (error) {
    logger.error(`usage: ${argv[0]} <to> <variable>`);
    process.exitCode = 1;
    return;
  }

  await emailAdapter.send({
    to,
    subject: '[SEL] Test email',
    kind: 'test',
    variables: { variable },
  });
}
