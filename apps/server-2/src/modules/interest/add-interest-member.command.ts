import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestAlreadyAddedError, InterestMemberAddedEvent } from './interest.entities';

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
    throw new InterestAlreadyAddedError();
  }

  await db.insert(schema.membersInterests).values({
    id: generator.id(),
    interestId,
    memberId,
    description,
  });

  events.publish(new InterestMemberAddedEvent(interestId, { memberId }));
}
