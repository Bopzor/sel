import { createMember } from '@sel/shared';
import { beforeEach, describe, expect, test } from 'vitest';

import { TestStore } from '../test-store';

import { addMember, selectFilteredMembers } from './members.slice';

describe('membersSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  describe('selectFilteredMembers', () => {
    test('empty search string', () => {
      const member = createMember();

      store.dispatch(addMember(member));

      expect(store.select(selectFilteredMembers, '')).toEqual([member]);
    });

    test('filter on member properties', () => {
      const cox = createMember({ firstName: 'cox' });
      const bop = createMember({ firstName: 'bop' });

      store.dispatch(addMember(cox));
      store.dispatch(addMember(bop));

      expect(store.select(selectFilteredMembers, 'ox')).toEqual([cox]);
    });
  });
});
