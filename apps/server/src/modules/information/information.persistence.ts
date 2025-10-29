import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { InformationInsert } from './information.entities';

export async function findInformationById(informationId: string) {
  return db.query.information.findFirst({
    where: eq(schema.information.id, informationId),
  });
}

export async function insertInformation(values: InformationInsert) {
  return db.insert(schema.information).values(values);
}

export async function updateInformation(informationId: string, values: Partial<InformationInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  return db
    .update(schema.information)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.information.id, informationId));
}
