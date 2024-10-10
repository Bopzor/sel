import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { BadRequest } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestMemberRemovedEvent } from '../interest.entities';

export type RemoveInterestMemberCommand = {
  interestId: string;
  memberId: string;
  description?: string;
};

export async function removeInterestMember(command: RemoveInterestMemberCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);

  const { interestId, memberId } = command;

  const where = and(
    eq(schema.membersInterests.interestId, interestId),
    eq(schema.membersInterests.memberId, memberId),
  );

  const existing = await db.query.membersInterests.findFirst({ where });

  if (!existing) {
    throw new BadRequest('Interest was not added');
  }

  await db.delete(schema.membersInterests).where(where);

  events.publish(new InterestMemberRemovedEvent(interestId, { memberId }));
}
