import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';
import { assert } from '@sel/utils';

import { AppState } from '../store/types';

export const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: {
    authenticationLinkRequested: false,
    member: null as Member | null,
  },
  reducers: {
    authenticationLinkRequested(state) {
      state.authenticationLinkRequested = true;
    },
    authenticatedMemberFetched(state, { payload: member }: PayloadAction<Member>) {
      state.member = member;
    },
  },
});

export const { authenticationLinkRequested, authenticatedMemberFetched } = authenticationSlice.actions;

const selectAuthenticationSlice = (state: AppState) => state.authentication;

export const selectAuthenticationLinkRequested = createSelector(selectAuthenticationSlice, (slice) => {
  return slice.authenticationLinkRequested;
});

export const selectAuthenticatedMemberUnsafe = createSelector(selectAuthenticationSlice, (slice) => {
  return slice.member;
});

export const selectAuthenticatedMember = createSelector(selectAuthenticatedMemberUnsafe, (member) => {
  assert(member, 'authenticated member is not defined');
  return member;
});
