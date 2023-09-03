import { createMember } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { TestStore } from '../../../test-store';
import { selectMembers } from '../../members.slice';

import { fetchMembers } from './fetch-members';

describe('fetchMembers', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it('fetches the list of members', async () => {
    const member = createMember();

    store.membersGateway.members = [member];

    await store.dispatch(fetchMembers());

    expect(store.select(selectMembers)).toEqual([member]);
  });
});
