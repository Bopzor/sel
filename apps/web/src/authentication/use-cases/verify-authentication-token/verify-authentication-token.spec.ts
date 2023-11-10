import { createAuthenticatedMember } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { TestStore } from '../../../test-store';
import { selectAuthenticatedMember } from '../../authentication.slice';

import { verifyAuthenticationToken } from './verify-authentication-token';

describe('verifyAuthenticationToken', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it('authenticates a member using an authentication token', async () => {
    const member = createAuthenticatedMember();

    store.authenticationGateway.authenticationTokens.add('token');
    store.authenticationGateway.authenticatedMember = member;

    await store.dispatch(verifyAuthenticationToken('token'));

    expect(store.select(selectAuthenticatedMember)).toEqual(member);
  });
});
