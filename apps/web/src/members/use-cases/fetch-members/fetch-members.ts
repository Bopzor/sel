import { MembersSort } from '@sel/shared';

import { createAsyncThunk } from '../../../store/create-thunk';

export const fetchMembers = createAsyncThunk(
  'fetchMembers',
  async ({ membersGateway }, sort?: MembersSort) => {
    return membersGateway.listMembers(sort);
  }
);
