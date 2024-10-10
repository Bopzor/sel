import { addDuration, isAfter } from '@sel/utils';

import { container } from 'src/infrastructure/container';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import {
  MemberAuthenticatedEvent,
  TokenExpiredError,
  TokenNotFoundError,
  TokenType,
} from './authentication.entities';
import { findTokenByValue, updateToken } from './token.persistence';

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
    throw new TokenNotFoundError();
  }

  if (isAfter(now, token.expirationDate)) {
    throw new TokenExpiredError();
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
