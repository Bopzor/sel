import { createAsyncThunk } from '../../../store/create-thunk';

export const fetchAuthenticatedMember = createAsyncThunk(
  'fetchAuthenticatedMember',
  async ({ authenticationGateway }) => {
    return authenticationGateway.getAuthenticatedMember();
  }
);
