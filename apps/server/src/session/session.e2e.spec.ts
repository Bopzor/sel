import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { TokenType, createToken } from '../authentication/token.entity';
import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';
import { createMember } from '../members/entities';
import { TOKENS } from '../tokens';

describe('[E2E] Session', () => {
  let test: E2ETest;

  beforeAll(async () => {
    test = new E2ETest();
    await test.init();
  });

  beforeEach(async () => {
    await test.reset();
  });

  afterAll(async () => {
    await test?.teardown();
  });

  it('fetches the authenticated member', async () => {
    const member = createMember();
    const token = createToken({ memberId: member.id, value: 'session-token', type: TokenType.session });

    await container.resolve(TOKENS.membersRepository).insert(member);
    await container.resolve(TOKENS.tokenRepository).insert(token);

    const { body } = await test.fetch('/session/member', { token: token.value });

    expect(body).toHaveProperty('id', member.id);
  });

  it('fails when no session token is provided', async () => {
    const { response } = await test.fetch('/session/member', { assertStatus: false });

    expect(response.status).toEqual(HttpStatus.unauthorized);
  });

  it('fails when an invalid session token is provided', async () => {
    const { response } = await test.fetch('/session/member', { token: 'invalid', assertStatus: false });

    expect(response.status).toEqual(HttpStatus.unauthorized);
    expect(response.headers.get('Set-Cookie')).toEqual('token=;Max-Age=0;HttpOnly;Path=/;SameSite=Lax');
  });
});
