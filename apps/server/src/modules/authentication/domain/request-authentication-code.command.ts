import { MemberStatus } from '@sel/shared';
import { addDuration } from '@sel/utils';
import { and, eq, inArray } from 'drizzle-orm';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { AuthenticationCodeRequestedEvent, TokenType } from '../authentication.entities';

type RequestAuthenticationCodeCommand = {
  email: string;
};

export async function requestAuthenticationCode(command: RequestAuthenticationCodeCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  const code = generator.numeric(6);

  const member = await db.query.members.findFirst({
    where: and(
      eq(schema.members.email, command.email),
      inArray(schema.members.status, [MemberStatus.active, MemberStatus.onboarding]),
    ),
  });

  if (!member) {
    return;
  }

  await db
    .update(schema.tokens)
    .set({ revoked: true, updatedAt: now })
    .where(
      and(
        eq(schema.tokens.memberId, member.id),
        eq(schema.tokens.type, TokenType.authentication),
        eq(schema.tokens.revoked, false),
      ),
    );

  await db.insert(schema.tokens).values({
    id: generator.id(),
    value: code,
    expirationDate: addDuration(now, { minutes: 10 }),
    memberId: member.id,
    type: TokenType.authentication,
  });

  events.publish(new AuthenticationCodeRequestedEvent(member.id, { code }));
}
