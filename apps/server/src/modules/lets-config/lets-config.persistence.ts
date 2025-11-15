import { defined } from '@sel/utils';

import { db, schema } from 'src/persistence';

export async function getLetsConfig() {
  return defined(await db.query.config.findFirst());
}

export async function createLetsConfig(values: typeof schema.config.$inferInsert) {
  await db.insert(schema.config).values(values);
}

export async function updateLetsConfig(values: Partial<typeof schema.config.$inferInsert>) {
  await db.update(schema.config).set(values);
}
