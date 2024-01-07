import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';

class Test extends E2ETest {}

describe('[E2E] Members', () => {
  let test: Test;

  beforeAll(async () => {
    test = new Test();
    await test.init();
  });

  beforeEach(async () => {
    await test.reset();
  });

  afterAll(async () => {
    await test?.teardown();
  });

  it('rejects unauthenticated requests', async () => {
    const { response } = await test.fetch('/members', { assertStatus: false });
    expect(response.status).toEqual(HttpStatus.unauthorized);
  });
});
