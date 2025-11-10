import { addDuration, isAfter } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { NotFound, Unauthorized } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberAuthenticatedEvent, TokenType } from '../authentication.entities';
import { updateToken } from '../token.persistence';

type VerifyAuthenticationCodeCommand = {
  code: string;
  sessionTokenId: string;
};

export async function verifyAuthenticationCode(command: VerifyAuthenticationCodeCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  const authenticationCode = await db.query.tokens.findFirst({
    where: ({ type, value }, { and, eq }) => and(eq(type, TokenType.authentication), eq(value, command.code)),
  });

  if (authenticationCode === undefined) {
    throw new NotFound('Code not found', { code: 'AuthenticationCodeNotFound' });
  }

  if (authenticationCode.revoked) {
    throw new Unauthorized('Code was revoked', { code: 'CodeRevoked' });
  }

  if (isAfter(now, authenticationCode.expirationDate)) {
    throw new Unauthorized('Code has expired', { code: 'CodeExpired' });
  }

  events.publish(new MemberAuthenticatedEvent(authenticationCode.memberId));

  await updateToken(authenticationCode.id, { revoked: true });

  await db.insert(schema.tokens).values({
    id: command.sessionTokenId,
    value: generator.token(),
    expirationDate: addDuration(now, { years: 1 }),
    memberId: authenticationCode.memberId,
    type: TokenType.session,
    revoked: false,
  });
}
