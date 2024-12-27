import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InterestInsert } from './interest.entities';

export function findInterestById(interestId: string) {
  return db.query.interests.findFirst({
    where: eq(schema.interests.id, interestId),
  });
}

export async function insertInterest(values: InterestInsert) {
  await db.insert(schema.interests).values(values);
}

export async function updateInterest(interestId: string, values: Partial<InterestInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  await db
    .update(schema.interests)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.interests.id, interestId));
}
