import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { TokenType } from '../authentication.entities';

type RevokeSessionTokenCommand = {
  tokenValue: string;
};

export async function revokeSessionToken(command: RevokeSessionTokenCommand): Promise<void> {
  const dateAdapter = container.resolve(TOKENS.date);
  const now = dateAdapter.now();

  await db
    .update(schema.tokens)
    .set({ revoked: true, updatedAt: now })
    .where(and(eq(schema.tokens.value, command.tokenValue), eq(schema.tokens.type, TokenType.session)));
}
