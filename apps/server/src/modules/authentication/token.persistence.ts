import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { TokenInsert } from './authentication.entities';

export async function findTokenById(tokenId: string) {
  return db.query.tokens.findFirst({
    where: eq(schema.tokens.id, tokenId),
  });
}

export async function findTokenByValue(tokenValue: string) {
  return db.query.tokens.findFirst({
    where: eq(schema.tokens.value, tokenValue),
  });
}

export async function insertToken(values: TokenInsert) {
  await db.insert(schema.tokens).values(values);
}

export async function updateToken(tokenId: string, values: Partial<TokenInsert>) {
  const date = container.resolve(TOKENS.date);
  const now = date.now();

  await db
    .update(schema.tokens)
    .set({ updatedAt: now, ...values })
    .where(eq(schema.tokens.id, tokenId));
}
