import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberCreatedEvent, MemberStatus } from '../member.entities';

type CreateMemberCommand = {
  memberId: string;
  firstName?: string;
  lastName?: string;
  email: string;
};

export async function createMember(command: CreateMemberCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  await db.insert(schema.members).values({
    id: command.memberId,
    status: MemberStatus.onboarding,
    firstName: command.firstName ?? '',
    lastName: command.lastName ?? '',
    email: command.email,
    emailVisible: false,
  });

  events.publish(new MemberCreatedEvent(command.memberId));
}
