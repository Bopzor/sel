import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';

import { AppState } from '../store/types';

import { membersFetched } from './use-cases/fetch-members/fetch-members';

const membersAdapter = createEntityAdapter<Member>();

export const membersSlice = createSlice({
  name: 'members',
  initialState: membersAdapter.getInitialState(),
  reducers: {},
  extraReducers(builder) {
    builder.addCase(membersFetched, membersAdapter.addMany.bind(membersAdapter));
  },
});

export const { selectAll: selectMembers } = membersAdapter.getSelectors(
  (state: AppState) => state[membersSlice.name]
);
