import { addDuration, defined } from '@sel/utils';
import { and, eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { insert } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEmailSender } from 'src/infrastructure/email';
import { initialize } from 'src/initialize';
import { resetDatabase, schema } from 'src/persistence';
import { clearDatabase, db } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { insertMember } from '../member';

import { Token, TokenType } from './authentication.entities';
import { requestAuthenticationLink } from './domain/request-authentication-link.command';
import { verifyAuthenticationToken } from './domain/verify-authentication-token.command';
import { findTokenById, findTokenByValue, insertToken } from './token.persistence';

describe('member', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);
  beforeEach(initialize);

  let emailSender: StubEmailSender;

  beforeEach(() => {
    emailSender = new StubEmailSender();
    container.bindValue(TOKENS.emailSender, emailSender);
  });

  async function getAuthenticationToken() {
    await container.resolve(TOKENS.events).waitForListeners();

    const email = defined(emailSender.emails[0]);
    const link = defined(email.text.match(/(http:\/\/.*)\n/)?.[1]);

    return new URL(link).searchParams.get('auth-token') as string;
  }

  it('authenticates', async () => {
    await insertMember(insert.member({ id: 'memberId', email: 'email' }));

    await requestAuthenticationLink({
      email: 'email',
    });

    const authenticationTokenValue = await getAuthenticationToken();
    const authenticationToken = await findTokenByValue(authenticationTokenValue);

    expect(authenticationToken).toEqual<Token>({
      id: expect.any(String),
      value: authenticationTokenValue,
      type: TokenType.authentication,
      memberId: 'memberId',
      expirationDate: expect.any(Date),
      revoked: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    await verifyAuthenticationToken({
      tokenValue: authenticationTokenValue,
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
    await insertMember(insert.member({ id: 'memberId', email: 'email' }));

    await requestAuthenticationLink({ email: 'email' });

    const authenticationTokenValue = await getAuthenticationToken();

    await verifyAuthenticationToken({
      tokenValue: authenticationTokenValue,
      sessionTokenId: 'sessionTokenId',
    });

    const authenticationToken = await findTokenByValue(await getAuthenticationToken());

    expect(authenticationToken).toHaveProperty('revoked', true);
  });

  it('revokes previous authentication tokens when requesting a new authentication token', async () => {
    await insertMember(insert.member({ id: 'memberId', email: 'email' }));

    await requestAuthenticationLink({ email: 'email' });
    await requestAuthenticationLink({ email: 'email' });

    const tokens = await db.query.tokens.findMany({
      where: and(eq(schema.tokens.type, TokenType.authentication), eq(schema.tokens.revoked, false)),
    });

    expect(tokens).toHaveLength(1);
  });

  it('fails when trying to use a revoked token', async () => {
    await insertMember(insert.member({ id: 'memberId', email: 'email' }));

    await insertToken(
      insert.token({
        memberId: 'memberId',
        value: 'token',
        revoked: true,
        expirationDate: addDuration(new Date(), { hours: 1 }),
      }),
    );

    await expect(verifyAuthenticationToken({ tokenValue: 'token', sessionTokenId: '' })).rejects.toThrow(
      'Token was revoked',
    );
  });
});
