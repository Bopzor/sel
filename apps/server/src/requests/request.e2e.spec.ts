import * as shared from '@sel/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { container } from '../container';
import { E2ETest } from '../e2e-test';
import { Member } from '../members/entities';
import { TOKENS } from '../tokens';

class Test extends E2ETest {
  member!: Member;
  token!: string;

  async setup(): Promise<void> {
    await super.setup();
    [this.member, this.token] = await this.createMember();
  }
}

describe('[E2E] Request', () => {
  let test: Test;
  let token: string;

  beforeAll(async () => {
    test = new Test();
    await test.setup();
    token = test.token;
  });

  afterAll(async () => {
    await test?.teardown();
  });

  it('rejects unauthenticated requests', async () => {
    const { response } = await test.fetch('/requests', { assertStatus: false });
    expect(response.status).toEqual(401);
  });

  it('fails with a 404 when the request does not exist', async () => {
    const { response } = await test.fetch('/requests/nope', { assertStatus: false });
    expect(response.status).toEqual(404);
  });

  it('creates a new request', async () => {
    expect(await test.fetch('/requests', { token })).toHaveProperty('body', []);

    const { body: requestId } = await test.fetch('/requests', {
      token,
      method: 'POST',
      body: { title: 'title', body: '<p>body</p>' },
    });

    expect(await test.fetch('/requests', { token })).toHaveProperty<shared.Request[]>('body', [
      expect.objectContaining({
        id: requestId,
        title: 'title',
        body: '<p>body</p>',
      }),
    ]);

    expect(await test.fetch(`/requests/${requestId}`, { token })).toHaveProperty('body.id', requestId);
  });

  it('creates a comment on an existing request', async () => {
    const requestId = await container.resolve(TOKENS.requestService).createRequest(test.member.id, '', '');

    await test.fetch(`/requests/${requestId}/comment`, { token, method: 'POST', body: { body: 'body' } });

    expect(await test.fetch(`/requests/${requestId}`, { token })).toHaveProperty<shared.Request[]>(
      'body.comments',
      [expect.objectContaining({ body: 'body' })]
    );
  });
});
