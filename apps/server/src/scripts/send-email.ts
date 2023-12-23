import { assert } from '@sel/utils';

import { container } from '../container';
import { EmailKind } from '../infrastructure/email/email.types';
import { TOKENS } from '../tokens';

// eslint-disable-next-line no-console
main(process.argv).catch(console.error);

async function main(argv: string[]) {
  const logger = container.resolve(TOKENS.logger);
  const emailAdapter = container.resolve(TOKENS.emailSender);

  const [to, kind, variables] = argv;

  try {
    assert(typeof to === 'string', 'missing <to>');
    assert(Object.values<string>(EmailKind).includes(kind), 'invalid email kind');
  } catch (error) {
    logger.error(`usage: ${argv[0]} <to> <kind> <variables>`);
    process.exitCode = 1;
    return;
  }

  await emailAdapter.send({
    to,
    subject: '[SEL] Test email',
    kind: kind as EmailKind,
    variables: JSON.parse(variables),
  });
}
