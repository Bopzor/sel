import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';
import { assert } from '@sel/utils';

import { AppState } from '../store/types';

import { fetchMember } from './use-cases/fetch-member/fetch-member';
import { fetchMembers } from './use-cases/fetch-members/fetch-members';

const membersAdapter = createEntityAdapter<Member>();

export const membersSlice = createSlice({
  name: 'members',
  initialState: membersAdapter.getInitialState(),
  reducers: {
    addMember: membersAdapter.addOne.bind(membersAdapter),
  },
  extraReducers(builder) {
    builder.addCase(fetchMembers.fulfilled, membersAdapter.setAll.bind(membersAdapter));

    builder.addCase(fetchMember.fulfilled, (state, { payload }) => {
      if (payload) {
        membersAdapter.addOne(state, payload);
      }
    });
  },
});

export const { addMember } = membersSlice.actions;

export const { selectAll: selectMembers, selectById: selectMemberUnsafe } = membersAdapter.getSelectors(
  (state: AppState) => state[membersSlice.name]
);

export const selectFilteredMembers = createSelector(
  [selectMembers, (state, search: string) => search],
  (members, search) =>
    members.filter((member) => Object.values(member).join(' ').match(new RegExp(search, 'gi')))
);

export const selectMember = createSelector(selectMemberUnsafe, (member) => {
  assert(member);

  return member;
});
