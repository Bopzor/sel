import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { RequestInsert } from './request.entities';

export async function findRequestById(requestId: string) {
  return db.query.requests.findFirst({
    where: eq(schema.requests.id, requestId),
  });
}

export async function insertRequest(values: RequestInsert) {
  return db.insert(schema.requests).values(values);
}

export async function updateRequest(requestId: string, values: Partial<RequestInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  return db
    .update(schema.requests)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.requests.id, requestId));
}
