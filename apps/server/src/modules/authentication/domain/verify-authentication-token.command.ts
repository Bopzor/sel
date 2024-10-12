import { addDuration, isAfter } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { NotFound, Unauthorized } from 'src/infrastructure/http';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberAuthenticatedEvent, TokenType } from '../authentication.entities';
import { findTokenByValue, updateToken } from '../token.persistence';

type VerifyAuthenticationTokenCommand = {
  tokenValue: string;
  sessionTokenId: string;
};

export async function verifyAuthenticationToken(command: VerifyAuthenticationTokenCommand): Promise<void> {
  const generator = container.resolve(TOKENS.generator);
  const now = container.resolve(TOKENS.date).now();
  const events = container.resolve(TOKENS.events);

  const token = await findTokenByValue(command.tokenValue);

  if (token === undefined) {
    throw new NotFound('Token does not exist');
  }

  if (token.revoked) {
    throw new Unauthorized('Token was revoked');
  }

  if (isAfter(now, token.expirationDate)) {
    throw new Unauthorized('Token has expired');
  }

  events.publish(new MemberAuthenticatedEvent(token.memberId));

  await updateToken(token.id, { revoked: true });

  await db.insert(schema.tokens).values({
    id: command.sessionTokenId,
    value: generator.token(),
    expirationDate: addDuration(now, { months: 1 }),
    type: TokenType.session,
    memberId: token.memberId,
    revoked: false,
  });
}
