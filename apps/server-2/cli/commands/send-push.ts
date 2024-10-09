import { assert } from '@sel/utils';
import { CliCommand } from '../types';
import { container } from 'src/infrastructure/container';
import { TOKENS } from 'src/tokens';
import { db, schema } from 'src/persistence';
import { eq } from 'drizzle-orm';

export const sendPush: CliCommand = async (args) => {
  const pushNotification = container.resolve(TOKENS.pushNotification);
  const [memberId, title, content, link] = args;

  assert(memberId, 'Missing memberId');
  assert(title, 'Missing title');
  assert(content, 'Missing content');
  assert(link, 'Missing link');

  const member = await db.query.members.findFirst({
    where: eq(schema.members.id, memberId),
    with: { devices: true },
  });

  if (!member) {
    throw new Error(`Member with id ${memberId} not found`);
  }

  pushNotification.init?.();

  await Promise.all(
    member.devices.map(async (device) => {
      await pushNotification.send(device.deviceSubscription, title, content, link);
    }),
  );
};
