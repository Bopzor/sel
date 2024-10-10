import { eq } from 'drizzle-orm';

import { db, schema } from 'src/persistence';

import { InterestInsert } from './interest.entities';

export function findInterestById(interestId: string) {
  return db.query.interests.findFirst({
    where: eq(schema.interests.id, interestId),
  });
}

export async function insertInterest(values: InterestInsert) {
  await db.insert(schema.interests).values(values);
}
