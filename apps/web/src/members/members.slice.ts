import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';
import { assert } from '@sel/utils';

import { AppState } from '../store/types';

import { memberFetched } from './use-cases/fetch-member/fetch-member';
import { membersFetched } from './use-cases/fetch-members/fetch-members';

const membersAdapter = createEntityAdapter<Member>();

export const membersSlice = createSlice({
  name: 'members',
  initialState: membersAdapter.getInitialState(),
  reducers: {
    addMember: membersAdapter.addOne.bind(membersAdapter),
  },
  extraReducers(builder) {
    builder.addCase(membersFetched, membersAdapter.setAll.bind(membersAdapter));
    builder.addCase(memberFetched, membersAdapter.addOne.bind(membersAdapter));
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
