import { assert, waitFor } from '@sel/utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { createMember } from '../members/entities/member';
import { TOKENS } from '../tokens';

describe('authentication e2e', () => {
  let test: E2ETest;

  beforeEach(async () => {
    test = new E2ETest();

    await test.setup();
    await test.startServer();
  });

  afterEach(async () => {
    await test.teardown();
  });

  it('requests an authentication link by email', async () => {
    const memberRepository = container.resolve(TOKENS.membersRepository);
    await memberRepository.insert(createMember({ email: 'member@domain.tld' }));

    const response = await fetch(
      'http://localhost:3030/authentication/request-authentication-link?email=member@domain.tld'
    );

    expect(response.status).toEqual(200);

    await waitFor(() => {
      expect(test.mailServer.emails).toHaveLength(1);
    });

    const email = test.mailServer.emails[0];
    const match = /(http:\/\/.*)\n/.exec(email.text as string);

    assert(match);

    const link = new URL(match[1]);
    const token = link.searchParams.get('auth-token');

    const response2 = await fetch(
      `http://localhost:3030/authentication/verify-authentication-token?token=${token}`
    );

    expect(response2.status).toEqual(200);
    expect(response2.headers.get('set-cookie')).toEqual(expect.stringMatching(/^token=/));
  });
});
