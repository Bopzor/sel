import * as shared from '@sel/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { TokenType } from '../authentication/token.entity';
import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';
import { Member } from '../members/entities';

class Test extends E2ETest {
  member!: Member;
  token!: string;

  async setup(): Promise<void> {
    await super.setup();

    this.member = await this.create.member();

    const token = await this.create.token(TokenType.session, this.member.id);
    this.token = token.value;
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

  it('rejects unauthenticated requests', async () => {
    const { response } = await test.fetch('/requests', { assertStatus: false });
    expect(response.status).toEqual(HttpStatus.unauthorized);
  });

  it('fails when the request does not exist', async () => {
    const { response } = await test.fetch('/requests/nope', { assertStatus: false });
    expect(response.status).toEqual(HttpStatus.notFound);
  });

  it('edits an existing request', async () => {
    const request = await test.create.request({
      requesterId: test.member.id,
      title: 'title',
      body: '<p>body</p>',
    });

    await test.fetch(`/requests/${request.id}`, {
      token,
      method: 'PUT',
      body: { title: 'new title', body: '<p>new body</p>' },
    });

    expect(await test.fetch(`/requests/${request.id}`, { token })).toHaveProperty<shared.Request>(
      'body',
      expect.objectContaining({
        id: request.id,
        title: 'new title',
        body: '<p>new body</p>',
      })
    );
  });

  it('prevents to edit a request when the authenticated member is not the requester', async () => {
    const requester = await test.create.member({ email: 'requester' });
    const request = await test.create.request({ requesterId: requester.id });

    expect(
      await test.fetch(`/requests/${request.id}`, {
        token,
        method: 'PUT',
        body: { title: '', body: '' },
        assertStatus: false,
      })
    ).toHaveProperty('response.status', HttpStatus.forbidden);
  });

  it('creates a comment on an existing request', async () => {
    const request = await test.create.request({ requesterId: test.member.id });

    await test.fetch(`/requests/${request.id}/comment`, { token, method: 'POST', body: { body: 'body' } });

    expect(await test.fetch(`/requests/${request.id}`, { token })).toHaveProperty<shared.Request[]>(
      'body.comments',
      [expect.objectContaining({ body: 'body' })]
    );
  });
});
