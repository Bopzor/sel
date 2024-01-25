import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';
import { createMember } from '../members/member.entity';
import { TOKENS } from '../tokens';

import { TokenType, createToken } from './token.entity';

describe('[E2E] Session', () => {
  let test: E2ETest;

  beforeAll(async () => {
    test = await E2ETest.create(E2ETest);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('fetches the authenticated member', async () => {
    const member = createMember();
    const token = createToken({ memberId: member.id, value: 'session-token', type: TokenType.session });

    await container.resolve(TOKENS.memberRepository).insert(member);
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
