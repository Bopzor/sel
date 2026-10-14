import * as shared from '@sel/shared';
import { eq, sql } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberInsert } from './member.entities';

export function findMemberById(memberId: string) {
  return db.query.members.findFirst({
    where: { id: memberId },
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

export async function appendMemberProfileSteps(memberId: string, steps: shared.ProfileStep[]) {
  if (steps.length === 0) {
    return;
  }

  const date = container.resolve(TOKENS.date);
  const newSteps = sql`array[${sql.join(
    steps.map((step) => sql`${step}`),
    sql`, `,
  )}]::text[]`;

  // A single statement, so that concurrent requests do not overwrite each other's steps.
  await db
    .update(schema.members)
    .set({
      updatedAt: date.now(),
      completedProfileSteps: sql`array(
        select step from unnest(${schema.members.completedProfileSteps} || ${newSteps}) with ordinality as t(step, position)
        group by step order by min(position)
      )`,
    })
    .where(eq(schema.members.id, memberId));
}
