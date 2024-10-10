import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberInsert } from './member.entities';

export function findMemberById(memberId: string) {
  return db.query.members.findFirst({
    where: eq(schema.members.id, memberId),
  });
}

export async function insertMember(values: MemberInsert) {
  await db.insert(schema.members).values(values);
}

export async function updateMember(memberId: string, values: Partial<MemberInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  await db
    .update(schema.members)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.members.id, memberId));
}
