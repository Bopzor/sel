import { createAsyncThunk } from '../../../store/create-thunk';
import { fetchAuthenticatedMember } from '../fetch-authenticated-member/fetch-authenticated-member';

export const verifyAuthenticationToken = createAsyncThunk(
  'verifyAuthenticationToken',
  async ({ dispatch, authenticationGateway }, token: string) => {
    await authenticationGateway.verifyAuthenticationToken(token);
    await dispatch(fetchAuthenticatedMember());
  }
);
