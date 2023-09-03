import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { membersFetched } from './use-cases/fetch-members/fetch-members';

const membersAdapter = createEntityAdapter();

export const membersSlice = createSlice({
  name: 'members',
  initialState: membersAdapter.getInitialState(),
  reducers: {},
  extraReducers(builder) {
    builder.addCase(membersFetched, membersAdapter.addMany.bind(membersAdapter));
  },
});
