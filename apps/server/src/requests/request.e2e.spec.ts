import * as shared from '@sel/shared';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { TokenType } from '../authentication/token.entity';
import { E2ETest } from '../e2e-test';
import { HttpStatus } from '../http-status';
import { Member } from '../members/member.entity';

class Test extends E2ETest {
  requester!: Member;
  requesterToken!: string;

  member!: Member;
  memberToken!: string;

  async setup(): Promise<void> {
    this.requester = await this.create.member({ firstName: 'Foo', lastName: 'Bar', email: 'requester' });
    const requesterToken = await this.create.token(TokenType.session, this.requester.id);
    this.requesterToken = requesterToken.value;

    this.member = await this.create.member({ email: 'member' });
    const memberToken = await this.create.token(TokenType.session, this.member.id);
    this.memberToken = memberToken.value;
  }
}

describe('[E2E] Request', () => {
  let test: Test;
  let token: string;

  beforeAll(async () => {
    test = await E2ETest.create(Test);
  });

  afterAll(() => test?.teardown());

  beforeEach(async () => {
    await test.reset();
    token = test.requesterToken;
  });

  afterEach(() => test?.waitForEventHandlers());

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

  it('sends a notification to all members excluding the requester', async () => {
    await test.fetch('/requests', {
      token,
      method: 'POST',
      body: { title: 'Title', body: '' },
    });

    await test.waitForEventHandlers();

    const { body: notifications } = await test.fetch('/session/notifications', { token: test.memberToken });
    expect(notifications).toHaveLength(1);
    expect(notifications).toHaveProperty('0.title', 'Demande de Foo B.');
    expect(notifications).toHaveProperty('0.content', 'Title');

    const { body: requesterNotifications } = await test.fetch('/session/notifications', { token });
    expect(requesterNotifications).toHaveLength(0);
  });

  it('rejects unauthenticated requests', async () => {
    const { response } = await test.fetch('/requests', { assertStatus: false });
    expect(response.status).toEqual(HttpStatus.unauthorized);
  });

  it('fails when the request does not exist', async () => {
    const { response } = await test.fetch('/requests/nope', { token, assertStatus: false });
    expect(response.status).toEqual(HttpStatus.notFound);
  });

  it('edits an existing request', async () => {
    const request = await test.create.request({
      requesterId: test.requester.id,
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
    const request = await test.create.request({ requesterId: test.requester.id });

    expect(
      await test.fetch(`/requests/${request.id}`, {
        token: test.memberToken,
        method: 'PUT',
        body: { title: '', body: '' },
        assertStatus: false,
      })
    ).toHaveProperty('response.status', HttpStatus.forbidden);
  });

  it('creates a comment on an existing request', async () => {
    const request = await test.create.request({ requesterId: test.requester.id });

    await test.fetch(`/requests/${request.id}/comment`, { token, method: 'POST', body: { body: 'body' } });

    expect(await test.fetch(`/requests/${request.id}`, { token })).toHaveProperty<shared.Request[]>(
      'body.comments',
      [expect.objectContaining({ body: 'body' })]
    );
  });
});
