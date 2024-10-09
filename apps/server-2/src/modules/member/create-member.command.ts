import { events } from 'src/infrastructure/events';
import { db, schema } from 'src/persistence';

import { MemberCreatedEvent } from './member.entities';

type CreateMemberCommand = {
  memberId: string;
  firstName?: string;
  lastName?: string;
  email: string;
};

export async function createMember(command: CreateMemberCommand): Promise<void> {
  await db.insert(schema.members).values({
    id: command.memberId,
    firstName: command.firstName ?? '',
    lastName: command.lastName ?? '',
    email: command.email,
  });

  events.emit(new MemberCreatedEvent(command.memberId));
}
