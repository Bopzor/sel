import { createMember } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { TestStore } from '../../../test-store';
import { selectAuthenticationLinkRequested } from '../../authentication.slice';

import { requestAuthenticationLink } from './request-authentication-link';

describe('requestAuthenticationLink', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it('requests an authentication link', async () => {
    const member = createMember();

    store.membersGateway.members = [member];

    await store.dispatch(requestAuthenticationLink(member.id));

    expect(store.select(selectAuthenticationLinkRequested)).toBe(true);
  });
});
