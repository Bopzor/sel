import { createAction } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';

import { createThunk } from '../../../store/create-thunk';

export const fetchMember = createThunk(async ({ dispatch, membersGateway }, memberId: string) => {
  const member = await membersGateway.getMember(memberId);

  if (member) {
    dispatch(memberFetched(member));
  }
});

export const memberFetched = createAction('member/fetched', (member: Member) => ({
  payload: member,
}));
