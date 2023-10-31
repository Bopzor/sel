import { createSelector, createSlice } from '@reduxjs/toolkit';

import { AppState } from '../store/types';

export const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: {
    authenticationLinkRequested: false,
  },
  reducers: {
    authenticationLinkRequested(state) {
      state.authenticationLinkRequested = true;
    },
  },
});

export const { authenticationLinkRequested } = authenticationSlice.actions;

const selectAuthenticationSlice = (state: AppState) => state.authentication;

export const selectAuthenticationLinkRequested = createSelector(selectAuthenticationSlice, (slice) => {
  return slice.authenticationLinkRequested;
});
