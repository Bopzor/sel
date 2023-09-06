import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';

import { AppState } from '../store/types';

import { membersFetched } from './use-cases/fetch-members/fetch-members';

const membersAdapter = createEntityAdapter<Member>();

export const membersSlice = createSlice({
  name: 'members',
  initialState: membersAdapter.getInitialState(),
  reducers: {
    addMember: membersAdapter.addOne.bind(membersAdapter),
  },
  extraReducers(builder) {
    builder.addCase(membersFetched, membersAdapter.addMany.bind(membersAdapter));
  },
});

export const { addMember } = membersSlice.actions;

export const { selectAll: selectMembers } = membersAdapter.getSelectors(
  (state: AppState) => state[membersSlice.name]
);

export const selectFilteredMembers = createSelector(
  [selectMembers, (state, search: string) => search],
  (members, search) => members.filter((member) => Object.values(member).join(' ').includes(search))
);
