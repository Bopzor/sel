import * as shared from '@sel/shared';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberCreatedEvent, MemberInsert } from '../member.entities';

type ChangeMemberRolesCommand = {
  memberId: string;
  roles: shared.MemberRole[];
};

export async function changeMemberRole(command: ChangeMemberRolesCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const values: Partial<MemberInsert> = {
    roles: command.roles,
  };

  if (command.roles.includes(shared.MemberRole.system)) {
    values.status = shared.MemberStatus.system;
  }

  await db.update(schema.members).set(values).where(eq(schema.members.id, command.memberId));

  events.publish(new MemberCreatedEvent(command.memberId));
}
