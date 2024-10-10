import { defined } from '@sel/utils';
import { and, eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { insert } from 'src/factories';
import { container } from 'src/infrastructure/container';
import { StubEmailSender } from 'src/infrastructure/email';
import { initialize } from 'src/initialize';
import { resetDatabase, schema } from 'src/persistence';
import { clearDatabase, db } from 'src/persistence/database';
import { TOKENS } from 'src/tokens';

import { MemberInsert } from '../member/member.entities';

import { Token, TokenType } from './authentication.entities';
import { requestAuthenticationLink } from './request-authentication-link.command';
import { verifyAuthenticationToken } from './verify-authentication-token.command';

describe('member', () => {
  beforeAll(resetDatabase);
  beforeEach(clearDatabase);
  beforeEach(initialize);

  let emailSender: StubEmailSender;

  beforeEach(() => {
    emailSender = new StubEmailSender();
    container.bindValue(TOKENS.emailSender, emailSender);
  });

  async function saveMember(values: Partial<MemberInsert>) {
    return db.insert(schema.members).values(insert.member(values)).execute();
  }

  async function findAuthenticationToken() {
    await container.resolve(TOKENS.events).waitForListeners();

    const email = defined(emailSender.emails[0]);
    const link = defined(email.text.match(/(http:\/\/.*)\n/)?.[1]);

    return new URL(link).searchParams.get('auth-token') as string;
  }

  it('authenticates', async () => {
    await saveMember({ id: 'memberId', email: 'email' });

    await requestAuthenticationLink({
      email: 'email',
    });

    const authenticationTokenValue = await findAuthenticationToken();

    const authenticationToken = await db.query.tokens.findFirst({
      where: eq(schema.tokens.value, authenticationTokenValue),
    });

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

    const sessionToken = await db.query.tokens.findFirst({
      where: eq(schema.tokens.id, 'sessionTokenId'),
    });

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
    await saveMember({ id: 'memberId', email: 'email' });

    await requestAuthenticationLink({ email: 'email' });

    const authenticationTokenValue = await findAuthenticationToken();

    await verifyAuthenticationToken({
      tokenValue: authenticationTokenValue,
      sessionTokenId: 'sessionTokenId',
    });

    const authenticationToken = await db.query.tokens.findFirst({
      where: eq(schema.tokens.value, await findAuthenticationToken()),
    });

    expect(authenticationToken).toHaveProperty('revoked', true);
  });

  it('revokes previous authentication tokens when requesting a new authentication token', async () => {
    await saveMember({ id: 'memberId', email: 'email' });

    await requestAuthenticationLink({ email: 'email' });
    await requestAuthenticationLink({ email: 'email' });

    const tokens = await db.query.tokens.findMany({
      where: and(eq(schema.tokens.type, TokenType.authentication), eq(schema.tokens.revoked, false)),
    });

    expect(tokens).toHaveLength(1);
  });
});
