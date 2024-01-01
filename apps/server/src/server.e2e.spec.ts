import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { E2ETest } from './e2e-test';
import { HttpStatus } from './http-status';

describe('[E2E] Server', () => {
  let test: E2ETest;

  beforeAll(async () => {
    test = new E2ETest();
    await test.setup();
  });

  afterAll(async () => {
    await test?.teardown();
  });

  it('starts a HTTP server', async () => {
    const response = await fetch('http://localhost:3030/health');
    expect(response.status).toEqual(HttpStatus.ok);
  });

  it.skip('handles zod errors', async () => {
    const response = await fetch('http://localhost:3030/members?sort=invalid');

    expect(response.status).toEqual(HttpStatus.badRequest);

    expect(await response.json()).toEqual({
      _errors: [],
      sort: {
        _errors: [expect.any(String)],
      },
    });
  });
});
