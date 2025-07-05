import * as shared from '@sel/shared';
import { sql } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { memberNumberSequence } from 'src/persistence/schema';
import { TOKENS } from 'src/tokens';

import { MemberCreatedEvent } from '../member.entities';

// cspell:words nextval

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
    number: sql`nextval(${memberNumberSequence.seqName})`,
    status: shared.MemberStatus.onboarding,
    firstName: command.firstName ?? '',
    lastName: command.lastName ?? '',
    email: command.email,
    emailVisible: false,
    roles: [shared.MemberRole.member],
  });

  events.publish(new MemberCreatedEvent(command.memberId));
}
