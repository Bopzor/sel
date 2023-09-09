import { createMember } from '@sel/shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { TestStore } from '../../../test-store';
import { selectMember } from '../../members.slice';

import { fetchMember } from './fetch-member';

describe('fetchMember', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  it("fetches a single member from it's id", async () => {
    const member = createMember();

    store.membersGateway.members = [member];

    await store.dispatch(fetchMember(member.id));

    expect(store.select(selectMember, member.id)).toEqual(member);
  });
});
