import { assert } from '@sel/utils';

import { container } from '../container';
import { EmailKind } from '../infrastructure/email/email.types';
import { TOKENS } from '../tokens';

main(process.argv).catch(console.error);

async function main(argv: string[]) {
  const emailAdapter = container.resolve(TOKENS.emailSender);

  const [to, kind, variables] = argv;

  try {
    assert(typeof to === 'string', 'missing <to>');
    assert(Object.values<string>(EmailKind).includes(kind), 'invalid email kind');
  } catch (error) {
    console.log(`usage: ${argv[0]} <to> <kind> <variables>`);
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
