import { addDuration } from '@sel/utils';
import { and, eq } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { AuthenticationLinkRequestedEvent, TokenType } from '../authentication.entities';
import { updateToken } from '../token.persistence';

type RequestAuthenticationLinkCommand = {
  email: string;
};

export async function requestAuthenticationLink(command: RequestAuthenticationLinkCommand): Promise<void> {
  const config = container.resolve(TOKENS.config);
  const generator = container.resolve(TOKENS.generator);
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

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
    await updateToken(previousToken.id, { revoked: true });
  }

  const tokenValue = generator.token();

  await db.insert(schema.tokens).values({
    id: generator.id(),
    value: tokenValue,
    expirationDate: addDuration(now, { months: 1 }),
    type: TokenType.authentication,
    memberId: member.id,
  });

  const authenticationUrl = new URL(config.app.baseUrl);
  authenticationUrl.searchParams.set('auth-token', tokenValue);
  const link = authenticationUrl.toString();

  events.publish(new AuthenticationLinkRequestedEvent(member.id, { link }));
}
