import { createAsyncThunk } from '../../../store/create-thunk';

export const fetchMember = createAsyncThunk('fetchMember', async ({ membersGateway }, memberId: string) => {
  return membersGateway.getMember(memberId);
});
