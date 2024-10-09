import { addDuration, isAfter } from '@sel/utils';
import { eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { events } from 'src/infrastructure/events';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import {
  MemberAuthenticatedEvent,
  TokenExpiredError,
  TokenNotFoundError,
  TokenType,
} from './authentication.entities';

type VerifyAuthenticationTokenCommand = {
  tokenValue: string;
  sessionTokenId: string;
};

export async function verifyAuthenticationToken(command: VerifyAuthenticationTokenCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);
  const dateAdapter = container.resolve(TOKENS.date);

  const now = dateAdapter.now();

  const token = await db.query.tokens.findFirst({
    where: eq(schema.tokens.value, command.tokenValue),
  });

  if (token === undefined) {
    throw new TokenNotFoundError();
  }

  if (isAfter(now, token.expirationDate)) {
    throw new TokenExpiredError();
  }

  events.emit(new MemberAuthenticatedEvent(token.memberId));

  await db.update(schema.tokens).set({ revoked: true, updatedAt: now }).where(eq(schema.tokens.id, token.id));

  const expirationDate = addDuration(dateAdapter.now(), { months: 1 });

  await db.insert(schema.tokens).values({
    id: command.sessionTokenId,
    value: generator.token(),
    expirationDate,
    type: TokenType.session,
    memberId: token.memberId,
    revoked: false,
  });
}
