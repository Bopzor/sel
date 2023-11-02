import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';

class Test extends E2ETest {}

describe('[E2E] Members', () => {
  let test: Test;

  beforeEach(async () => {
    test = new Test();
    await test.setup();
  });

  afterEach(async () => {
    await test?.teardown();
  });

  it('rejects unauthenticated requests', async () => {
    const [response] = await test.fetch('/members', { assertStatus: false });
    expect(response.status).toEqual(401);
  });
});
