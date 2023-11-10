import { createMember } from '@sel/shared';
import { assert, waitFor } from '@sel/utils';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';

describe('[E2E] Authentication', () => {
  let test: E2ETest;

  beforeAll(async () => {
    test = new E2ETest();
    await test.setup();
  });

  afterAll(async () => {
    await test?.teardown();
  });

  it('requests an authentication link by email', async () => {
    await test.insertMember(createMember({ email: 'member@domain.tld' }));

    await test.fetch('/authentication/request-authentication-link?email=member@domain.tld', {
      method: 'POST',
    });

    await waitFor(() => {
      expect(test.mailServer.emails).toHaveLength(1);
    });

    const email = test.mailServer.emails[0];
    const match = /(http:\/\/.*)\n/.exec(email.text as string);

    assert(match);

    const link = new URL(match[1]);
    const token = link.searchParams.get('auth-token');

    const [response] = await test.fetch(`/authentication/verify-authentication-token?token=${token}`);

    expect(response.headers.get('set-cookie')).toEqual(expect.stringMatching(/^token=/));
  });
});
