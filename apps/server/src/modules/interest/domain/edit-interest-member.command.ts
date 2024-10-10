import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { BadRequest } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestMemberEditedEvent } from '../interest.entities';

export type EditInterestMemberCommand = {
  interestId: string;
  memberId: string;
  description?: string;
};

export async function editInterestMember(command: EditInterestMemberCommand): Promise<void> {
  const events = container.resolve(TOKENS.events);
  const now = container.resolve(TOKENS.date).now();

  const { interestId, memberId, description } = command;

  const memberInterest = await db.query.membersInterests.findFirst({
    where: and(
      eq(schema.membersInterests.interestId, interestId),
      eq(schema.membersInterests.memberId, memberId),
    ),
  });

  if (!memberInterest) {
    throw new BadRequest('Interest was not added');
  }

  await db
    .update(schema.membersInterests)
    .set({
      description: description ?? null,
      updatedAt: now,
    })
    .where(eq(schema.membersInterests.id, memberInterest.id));

  events.publish(new InterestMemberEditedEvent(interestId, { memberId }));
}
