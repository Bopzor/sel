import { createAction } from '@reduxjs/toolkit';
import { Member, MembersSort } from '@sel/shared';

import { createThunk } from '../../../store/create-thunk';

export const fetchMembers = createThunk(async ({ dispatch, membersGateway }, sort?: MembersSort) => {
  const members = await membersGateway.listMembers(sort);

  dispatch(membersFetched(members));
});

export const membersFetched = createAction('members/list-fetched', (members: Member[]) => ({
  payload: members,
}));
