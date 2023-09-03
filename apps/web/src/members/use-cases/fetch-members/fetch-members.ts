import { createAction } from '@reduxjs/toolkit';
import { Member } from '@sel/shared';

import { createThunk } from '../../../store/create-thunk';

export const fetchMembers = createThunk(async ({ dispatch, membersGateway }) => {
  const members = await membersGateway.listMembers();

  dispatch(membersFetched(members));
});

export const membersFetched = createAction('members/list-fetched', (members: Member[]) => ({
  payload: members,
}));
