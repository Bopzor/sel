import { pick } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

type RegisterDeviceCommand = {
  memberId: string;
  deviceSubscription: string;
  deviceType: string;
};

export async function registerDevice(command: RegisterDeviceCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);

  await db.insert(schema.memberDevices).values({
    id: generator.id(),
    ...pick(command, ['memberId', 'deviceSubscription', 'deviceType']),
  });
}
