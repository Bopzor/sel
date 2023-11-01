import { createMember } from '@sel/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TokenType, createToken } from '../authentication/token.entity';
import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { TOKENS } from '../tokens';

describe('[E2E] Session', () => {
  let test: E2ETest;

  beforeEach(async () => {
    test = new E2ETest();
    await test.setup();
  });

  afterEach(async () => {
    await test?.teardown();
  });

  it('fetches the authenticated member', async () => {
    const member = createMember();
    const token = createToken({ memberId: member.id, value: 'session-token', type: TokenType.session });

    await container.resolve(TOKENS.membersRepository).insert(member);
    await container.resolve(TOKENS.tokenRepository).insert(token);

    const [, body] = await test.fetch('/session/member', { token: token.value });

    expect(body).toHaveProperty('id', member.id);
  });

  it('fails with a 401 unauthorized error when no session token is provided', async () => {
    const [response] = await test.fetch('/session/member', { assertStatus: false });

    expect(response.status).toEqual(401);
  });

  it('fails with a 401 unauthorized error when an invalid session token is provided', async () => {
    const [response] = await test.fetch('/session/member', { token: 'invalid', assertStatus: false });

    expect(response.status).toEqual(401);
  });
});
