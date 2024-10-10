import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { BadRequest } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestMemberAddedEvent } from './interest.entities';

export type AddInterestMemberCommand = {
  interestId: string;
  memberId: string;
  description?: string;
};

export async function addInterestMember(command: AddInterestMemberCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);
  const events = container.resolve(TOKENS.events);

  const { interestId, memberId, description } = command;

  const existing = await db.query.membersInterests.findFirst({
    where: and(
      eq(schema.membersInterests.interestId, interestId),
      eq(schema.membersInterests.memberId, memberId),
    ),
  });

  if (existing) {
    throw new BadRequest('Interest was already added');
  }

  await db.insert(schema.membersInterests).values({
    id: generator.id(),
    interestId,
    memberId,
    description,
  });

  events.publish(new InterestMemberAddedEvent(interestId, { memberId }));
}
