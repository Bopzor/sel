import { MemberStatus } from '@sel/shared';
import { addDuration, defined } from '@sel/utils';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { persist } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEmailSender } from 'src/infrastructure/email';
import { initialize } from 'src/initialize';
import { resetDatabase, schema } from 'src/persistence';
import { clearDatabase, db } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { Token, TokenType } from './authentication.entities';
import { requestAuthenticationCode } from './domain/request-authentication-code.command';
import { verifyAuthenticationCode } from './domain/verify-authentication-code.command';
import { findTokenById, findTokenByValue } from './token.persistence';

describe('member', () => {
  beforeAll(resetDatabase);
  beforeEach(initialize);
  afterEach(clearDatabase);

  let emailSender: StubEmailSender;

  beforeEach(() => {
    emailSender = new StubEmailSender();
    container.bindValue(TOKENS.emailSender, emailSender);
  });

  async function getAuthenticationCode() {
    await container.resolve(TOKENS.events).waitForListeners();

    const email = defined(emailSender.emails[0]);
    const match = defined(email.text.match(/: (\d{6})\n/)?.[1]);

    return match;
  }

  it('authenticates', async () => {
    await persist.member({ id: 'memberId', email: 'email' });

    await requestAuthenticationCode({
      email: 'email',
    });

    const code = await getAuthenticationCode();
    const token = await findTokenByValue(code);

    expect(token).toEqual<Token>({
      id: expect.any(String),
      value: code,
      type: TokenType.authentication,
      memberId: 'memberId',
      expirationDate: expect.any(Date),
      revoked: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    await verifyAuthenticationCode({
      code,
      sessionTokenId: 'sessionTokenId',
    });

    const sessionToken = await findTokenById('sessionTokenId');

    expect(sessionToken).toEqual<Token>({
      id: 'sessionTokenId',
      value: expect.any(String),
      type: TokenType.session,
      memberId: 'memberId',
      expirationDate: expect.any(Date),
      revoked: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('revokes the authentication tokens after verifying it', async () => {
    await persist.member({ id: 'memberId', email: 'email' });

    await requestAuthenticationCode({ email: 'email' });

    const code = await getAuthenticationCode();

    await verifyAuthenticationCode({
      code,
      sessionTokenId: 'sessionTokenId',
    });

    const authenticationToken = await findTokenByValue(await getAuthenticationCode());

    expect(authenticationToken).toHaveProperty('revoked', true);
  });

  it('revokes previous authentication tokens when requesting a new authentication token', async () => {
    await persist.member({ id: 'memberId', email: 'email' });

    await requestAuthenticationCode({ email: 'email' });
    await requestAuthenticationCode({ email: 'email' });

    const tokens = await db.query.tokens.findMany({
      where: and(eq(schema.tokens.type, TokenType.authentication), eq(schema.tokens.revoked, false)),
    });

    expect(tokens).toHaveLength(1);
  });

  it('fails when trying to use a revoked token', async () => {
    await persist.member({ id: 'memberId', email: 'email' });

    await persist.token({
      memberId: 'memberId',
      value: 'code',
      revoked: true,
      expirationDate: addDuration(new Date(), { hours: 1 }),
    });

    await expect(verifyAuthenticationCode({ code: 'code', sessionTokenId: '' })).rejects.toThrow(
      'Code was revoked',
    );
  });

  it('does not create a token when the member is inactive', async () => {
    await persist.member({ id: 'memberId', email: 'email', status: MemberStatus.inactive });

    await requestAuthenticationCode({ email: 'email' });

    await expect(db.query.tokens.findMany()).resolves.toHaveLength(0);
  });
});
