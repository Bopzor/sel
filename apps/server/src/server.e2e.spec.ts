import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from './e2e-test';

describe('Server E2E', () => {
  let test: E2ETest;

  beforeEach(async () => {
    test = new E2ETest();
    await test.setup();
  });

  afterEach(async () => {
    await test?.teardown();
  });

  it('starts a HTTP server', async () => {
    const response = await fetch('http://localhost:3030/members');
    expect(response.status).toEqual(200);
  });

  it('handles zod errors', async () => {
    const response = await fetch('http://localhost:3030/members?sort=invalid');

    expect(response.status).toEqual(400);

    expect(await response.json()).toEqual({
      _errors: [],
      sort: {
        _errors: [expect.any(String)],
      },
    });
  });
});
