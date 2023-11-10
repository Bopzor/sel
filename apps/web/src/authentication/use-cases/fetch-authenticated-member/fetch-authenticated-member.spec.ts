import { createAuthenticatedMember } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { TestStore } from '../../../test-store';
import { selectAuthenticatedMember, selectAuthenticatedMemberUnsafe } from '../../authentication.slice';

import { fetchAuthenticatedMember } from './fetch-authenticated-member';

describe('fetchAuthenticatedMember', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it('fetches the member related to the current session', async () => {
    const member = createAuthenticatedMember();

    store.authenticationGateway.authenticatedMember = member;

    await store.dispatch(fetchAuthenticatedMember());

    expect(store.select(selectAuthenticatedMember)).toEqual(member);
  });

  it('does not set the authenticated member when they are not authenticated', async () => {
    await store.dispatch(fetchAuthenticatedMember());

    expect(store.select(selectAuthenticatedMemberUnsafe)).toBeNull();
  });
});
