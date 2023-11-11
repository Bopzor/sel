import { createSelector, createSlice } from '@reduxjs/toolkit';
import { AuthenticatedMember } from '@sel/shared';
import { assert } from '@sel/utils';

import { AppState } from '../store/types';

import { fetchAuthenticatedMember } from './use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { requestAuthenticationLink } from './use-cases/request-authentication-link/request-authentication-link';

export const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: {
    authenticationLinkRequested: false,
    member: null as AuthenticatedMember | null,
  },
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchAuthenticatedMember.fulfilled, (state, { payload }) => {
      state.member = payload ?? null;
    });

    builder.addCase(requestAuthenticationLink.fulfilled, (state) => {
      state.authenticationLinkRequested = true;
    });
  },
});

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
