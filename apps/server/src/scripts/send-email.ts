import { assert } from '@sel/utils';

import { container } from '../container';
import { TOKENS } from '../tokens';

main().catch(console.error);

async function main() {
  const emailAdapter = container.resolve(TOKENS.email);
  const to = process.env.TO;

  assert(typeof to === 'string', 'missing environment variable TO');

  await emailAdapter.send({
    to,
    subject: '[SEL] Test email',
    body: {
      text: 'This is a test email.',
      html: '<p>This is a test email</p>',
    },
  });
}
