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
    await store.dispatch(requestAuthenticationLink('email'));

    expect(store.select(selectAuthenticationLinkRequested)).toBe(true);
  });
});
