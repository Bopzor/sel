import { assert, waitFor } from '@sel/utils';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { createMember } from '../members/member.entity';
import { TOKENS } from '../tokens';

describe('[E2E] Authentication', () => {
  let test: E2ETest;

  beforeAll(async () => {
    test = await E2ETest.create(E2ETest);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('requests an authentication link by email', async () => {
    const memberRepository = container.resolve(TOKENS.memberRepository);

    await memberRepository.insert(createMember({ email: 'member@domain.tld' }));

    await test.fetch('/authentication/request-authentication-link?email=member@domain.tld', {
      method: 'POST',
    });

    await test.waitForEventHandlers();

    // mail is sent asynchronously
    await waitFor(() => {
      expect(test.mailServer.emails).toHaveLength(1);
    });

    const email = test.mailServer.emails[0];
    const match = /(http:\/\/.*)\n/.exec(email.text as string);

    assert(match);

    const link = new URL(match[1]);
    const token = link.searchParams.get('auth-token');

    const { response } = await test.fetch(`/authentication/verify-authentication-token?token=${token}`);

    expect(response.headers.get('set-cookie')).toEqual(expect.stringMatching(/^token=/));
  });
});
