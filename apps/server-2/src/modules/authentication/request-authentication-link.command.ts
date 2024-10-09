import { addDuration } from '@sel/utils';
import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { events } from 'src/infrastructure/events';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { AuthenticationLinkRequestedEvent, TokenInsert, TokenType } from './authentication.entities';

type RequestAuthenticationLinkCommand = {
  email: string;
};

export async function requestAuthenticationLink(command: RequestAuthenticationLinkCommand): Promise<void> {
  const config = container.resolve(TOKENS.config);
  const generator = container.resolve(TOKENS.generator);
  const dateAdapter = container.resolve(TOKENS.date);

  const now = dateAdapter.now();

  const member = await db.query.members.findFirst({
    where: eq(schema.members.email, command.email),
  });

  if (!member) {
    return;
  }

  const previousToken = await db.query.tokens.findFirst({
    where: and(eq(schema.tokens.memberId, member.id), eq(schema.tokens.type, TokenType.authentication)),
  });

  if (previousToken) {
    await db
      .update(schema.tokens)
      .set({ revoked: true, updatedAt: now })
      .where(eq(schema.tokens.id, previousToken.id));
  }

  const expirationDate = addDuration(dateAdapter.now(), { months: 1 });

  const token: TokenInsert = {
    id: generator.id(),
    value: generator.token(),
    expirationDate,
    type: TokenType.authentication,
    memberId: member.id,
  };

  await db.insert(schema.tokens).values(token);

  const authenticationUrl = new URL(config.app.baseUrl);
  authenticationUrl.searchParams.set('auth-token', token.value);

  events.emit(new AuthenticationLinkRequestedEvent(member.id, authenticationUrl.toString()));
}
