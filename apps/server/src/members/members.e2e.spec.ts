import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';

class Test extends E2ETest {}

describe('[E2E] Members', () => {
  let test: Test;

  beforeAll(async () => {
    test = await E2ETest.create(E2ETest);
  });

  afterAll(() => test?.teardown());

  beforeEach(() => test.reset());
  afterEach(() => test?.waitForEventHandlers());

  it('rejects unauthenticated requests', async () => {
    const { response } = await test.fetch('/members', { assertStatus: false });
    expect(response.status).toEqual(HttpStatus.unauthorized);
  });
});
